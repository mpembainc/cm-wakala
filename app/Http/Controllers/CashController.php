<?php

namespace App\Http\Controllers;

use App\Helpers\ApiResponse;
use App\Http\Resources\CashTransactionResource;
use App\Models\Cash;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;

class CashController extends Controller
{
    public function index(Request $request)
    {
        $where = [];
        if ($request->userId) $where['user_id'] = $request->userId;
        $cashQuery = Cash::where($where);

        if ($request->startDate && !$request->endDate) $cashQuery->whereDate('created_at', $request->startDate);
        if (!$request->startDate && $request->endDate) $cashQuery->whereDate('created_at', $request->endDate);
        if ($request->startDate && $request->endDate) $cashQuery->where(function (Builder $query) use ($request) {
            $query->whereDate('created_at', '>=', $request->startDate)
                ->whereDate('created_at', '<=', $request->endDate);
        });

        if (is_array($request->query()) && count($request->query()) == 0) {
            $today = Carbon::parse()->format('Y-m-d');
            $cashQuery->whereDate('created_at', $today);
        }

        $cashes = $cashQuery->orderByDesc('id')->get();
        $result = [
            'balance' => Cash::getBalance(),
            'transactions' => CashTransactionResource::collection($cashes)
        ];
        return ApiResponse::success($result);
    }

    public function store(Request $request)
    {
        $cash = new Cash();
        $cash->amount = $request->amount;
        $cash->remark = strtoupper($request->description);
        $cash->user_id = auth()->id();
        $cash->save();

        return ApiResponse::success($cash);
    }

    public function balance()
    {
        $balance = Cash::sum('amount');
        return ApiResponse::success(floatval($balance));
    }
}
