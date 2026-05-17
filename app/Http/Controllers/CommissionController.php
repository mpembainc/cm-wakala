<?php

namespace App\Http\Controllers;

use App\Helpers\ApiResponse;
use App\Http\Requests\PostCommissionRequest;
use App\Http\Resources\CommissionResource;
use App\Models\Commission;
use App\Models\Transaction;
use Carbon\Carbon;
use Illuminate\Http\Request;

class CommissionController extends Controller
{
    function index(Request $request)
    {
        $month = date('m');
        $year = date('Y');

        if ($request->month) {
            $data = explode('-', $request->month);
            $month = $data[0];
            $year = $data[1];
        }

        $commisions = Commission::whereMonth('created_at', $month)
            ->whereYear('created_at', $year)
            ->orderByDesc('id')
            ->get();

        $result = [
            'balance' => intval($commisions->sum('amount')),
            'transactions' => CommissionResource::collection($commisions)
        ];
        return ApiResponse::success($result);
    }

    function store(PostCommissionRequest $request)
    {
        $commission = new Commission();
        $commission->network_id = $request->networkId;
        $commission->amount = $request->amount;
        $commission->remark = $request->remark;
        $commission->user_id = auth()->id();
        $commission->save();

        #Save Network Transaction
        $transaction = new Transaction();
        $transaction->network_id = $request->networkId;
        $transaction->account_number = "COMMISSION";
        $transaction->account_name = "COMMISSION";
        $transaction->amount = $request->amount;
        $transaction->customer = "COMMISSION";
        $transaction->user_id = auth()->id();
        $transaction->save();

        return ApiResponse::success(new CommissionResource($commission));
    }
}