<?php

namespace App\Http\Controllers;

use App\Helpers\ApiResponse;
use App\Http\Requests\TransactionRequest;
use App\Http\Resources\TransactionResource;
use App\Models\Cash;
use App\Models\Transaction;
use Carbon\Carbon;
use Illuminate\Auth\Middleware\Authorize;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class TransactionController extends Controller
{
    public function index(Request $request)
    {
        if (!auth()->user()->can('list_transactions'))
            return ApiResponse::error(403);

        $today = Carbon::parse()->format('Y-m-d');
        $where = [];

        if ($request->networkId)
            $where['network_id'] = $request->networkId;
        if ($request->userId)
            $where['user_id'] = $request->userId;
        $query = Transaction::where($where);

        if ($request->startDate && !$request->endDate) {
            $query->whereDate('created_at', $request->startDate);
        }

        if (!$request->startDate && $request->endDate) {
            $query->whereDate('created_at', $request->endDate);
        }

        if ($request->startDate && $request->endDate) {
            $query->where(function (Builder $builder) use ($request) {
                $builder->whereDate('created_at', '>=', $request->startDate)
                    ->whereDate('created_at', '<=', $request->endDate);
            });
        }

        if ($request->search && !empty($request->search)) {
            $query->where(function (Builder $builder) use ($request) {
                $search = is_numeric($request->search)
                    ? ($request->search > 0 ? -$request->search : abs($request->search))
                    : $request->search;

                $builder->where('account_name', 'LIKE', "%{$search}%")
                    ->orWhere('account_number', 'LIKE', "%{$search}%")
                    ->orWhere('amount', 'LIKE', "%{$search}%");
            });
        }

        if ((is_array($request->query()) && count($request->query()) == 0) || (!$request->startDate && !$request->endDate)) {
            $query->whereDate('created_at', $today);
        }

        $transactions = $query->orderByDesc('id')->get();

        return ApiResponse::success(TransactionResource::collection($transactions));
    }

    public function store(TransactionRequest $request)
    {
        #Save Network Transaction
        $transaction = new Transaction();
        $transaction->network_id = $request->networkId;
        $transaction->account_number = $request->accountNumber;
        $transaction->account_name = strtoupper($request->accountName);
        $transaction->amount = $request->amount > 0 ? -$request->amount : abs($request->amount);
        $transaction->customer = $request->customer ? strtoupper($request->customer) : strtoupper($request->accountName);
        $transaction->commission = $request->commission;
        $transaction->fee = $request->fee;
        $transaction->user_id = auth()->id();
        $transaction->save();

        #Save Cash Transaction
        $cash = new Cash();
        $cash->transaction_id = $transaction->id;
        $cash->amount = $request->fee ? $request->amount + $request->fee : $request->amount;
        $cash->user_id = auth()->id();
        $cash->save();

        return ApiResponse::success(new TransactionResource($transaction));
    }

    public function destroy($id)
    {
        $network = Transaction::find($id);
        if (!$network)
            return ApiResponse::error(404);
        $network->delete();

        return ApiResponse::success(['message' => 'deleted']);
    }

    public function update(Request $request, $id)
    {
        $transaction = Transaction::find($id);
        if (!$transaction)
            return ApiResponse::error(404);

        $transaction->network_id = $request->networkId;
        $transaction->account_number = $request->accountNumber;
        $transaction->account_name = $request->accountName;
        $transaction->amount = $request->amount;
        $transaction->customer = $request->customer;
        $transaction->commission = $request->commission;
        $transaction->save();

        return ApiResponse::success(new TransactionResource($transaction));
    }

    public function search(Request $request)
    {
        $search = $request->query('q');

        if (!$search) {
            return response()->json([]);
        }

        $results = DB::table('transactions')
            ->select('account_number as number', 'account_name as name', 'network_id as networkId', 'networks.name as networkName')
            ->join('networks', 'transactions.network_id', '=', 'networks.id')
            ->where('account_number', 'like', $search . '%')
            ->groupBy('number', 'name', 'networkId', 'networkName')
            ->orderByDesc(DB::raw('MAX(transactions.created_at)'))
            ->limit(10)
            ->get();

        return response()->json($results);
    }
}
