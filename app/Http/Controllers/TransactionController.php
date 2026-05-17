<?php

namespace App\Http\Controllers;

use App\Http\Requests\TransactionRequest;
use App\Models\Cash;
use App\Models\Network;
use App\Models\Transaction;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Spatie\Permission\Models\Permission;

class TransactionController extends Controller
{
    public function index(Request $request)
    {
        if (!auth()->user()->can('list_transactions')) {
            abort(403);
        }

        $where = [];
        if ($request->networkId) {
            $where['network_id'] = $request->networkId;
        }
        if ($request->userId) {
            $where['user_id'] = $request->userId;
        }

        $query = Transaction::with(['network', 'user'])->where($where);

        if ($request->startDate && !$request->endDate) {
            $query->whereDate('created_at', $request->startDate);
        }
        if (!$request->startDate && $request->endDate) {
            $query->whereDate('created_at', $request->endDate);
        }
        if ($request->startDate && $request->endDate) {
            $query->whereBetween('created_at', [
                Carbon::parse($request->startDate)->startOfDay(),
                Carbon::parse($request->endDate)->endOfDay(),
            ]);
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

        // If no filter parameters are passed, default to showing today's transactions!
        if (empty($request->startDate) && empty($request->endDate) && empty($request->networkId) && empty($request->userId) && empty($request->search)) {
            $query->whereDate('created_at', Carbon::today());
        }

        $transactions = $query->orderByDesc('id')->get();

        $user = Auth::user();
        $permissions = $user->hasRole('admin')
            ? Permission::all()->pluck('name')
            : $user->getAllPermissions()->pluck('name');

        $users = [];
        if ($user->can('list_users')) {
            $users = User::orderBy('name')->get(['id', 'name']);
        }

        return Inertia::render('transactions/index', [
            'transactions' => $transactions->map(function ($t) {
                return [
                    'id' => $t->id,
                    'network' => $t->network->name ?? 'UNKNOWN',
                    'networkId' => $t->network_id,
                    'accountNumber' => $t->account_number,
                    'accountName' => $t->account_name,
                    'amount' => floatval($t->amount),
                    'customer' => $t->customer,
                    'commission' => floatval($t->commission),
                    'fee' => floatval($t->fee),
                    'createdAt' => $t->created_at->toIso8601String(),
                    'createdBy' => strtoupper($t->user->name ?? 'SYSTEM'),
                ];
            }),
            'networks' => Network::getBalance()->map(function ($net) {
                return [
                    'id' => $net->id,
                    'name' => $net->name,
                    'balance' => floatval($net->balance),
                ];
            }),
            'cashBalance' => floatval(Cash::getBalance()),
            'users' => $users,
            'filters' => [
                'startDate' => $request->startDate ?? '',
                'endDate' => $request->endDate ?? '',
                'networkId' => $request->networkId ?? '',
                'userId' => $request->userId ?? '',
                'search' => $request->search ?? '',
            ],
            'user' => [
                'name' => $user->name,
                'permissions' => $permissions,
            ],
        ]);
    }

    public function store(TransactionRequest $request)
    {
        if (!auth()->user()->can('add_transaction')) {
            abort(403);
        }

        # Check Network Float balance is enough
        $network = Network::find($request->networkId);
        if (!$network) {
            return redirect()->back()->withErrors(['networkId' => 'Mtandao haukupatikana.']);
        }

        // Calculate current network float balance
        $currentBalance = floatval($network->transactions()->sum('amount'));
        if ($currentBalance < floatval($request->amount)) {
            return redirect()->back()->withErrors(['amount' => 'Salio la float kwenye mtandao halitoshi kufanya muamala huu.']);
        }

        // if (floatval($request->amount) <= 0) {
        //     return redirect()->back()->withErrors(['amount' => 'Kiasi cha muamala lazima kiwe kikubwa kuliko 0.']);
        // }

        #Save Network Transaction
        $transaction = new Transaction();
        $transaction->network_id = $request->networkId;
        $transaction->account_number = $request->accountNumber;
        $transaction->account_name = strtoupper($request->accountName);
        $transaction->amount = $request->amount > 0 ? -$request->amount : abs($request->amount);
        $transaction->customer = $request->customer ? strtoupper($request->customer) : strtoupper($request->accountName);
        $transaction->commission = $request->commission ?? 0;
        $transaction->fee = $request->fee ?? 0;
        $transaction->user_id = auth()->id();
        $transaction->save();

        #Save Cash Transaction
        $cash = new Cash();
        $cash->transaction_id = $transaction->id;
        $cash->amount = $request->fee ? $request->amount + $request->fee : $request->amount;
        $cash->user_id = auth()->id();
        $cash->save();

        return redirect()->back();
    }

    public function destroy($id)
    {
        if (!auth()->user()->can('delete_transaction')) {
            abort(403);
        }

        $transaction = Transaction::findOrFail($id);

        // Delete associated Cash record first
        Cash::where('transaction_id', $transaction->id)->delete();
        $transaction->delete();

        return redirect()->back();
    }

    public function search(Request $request)
    {
        if (!auth()->check()) {
            return response()->json([]);
        }

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
