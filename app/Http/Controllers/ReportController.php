<?php

namespace App\Http\Controllers;

use App\Helpers\ApiResponse;
use App\Models\Cash;
use App\Models\Transaction;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ReportController extends Controller
{
    private int $commissionBefore = 0;

    function user_transactions(Request $request)
    {
        $query = DB::table('transactions')
            ->select('users.id as userId', 'users.name as username', DB::raw('count(*) as total'))
            ->join('users', 'transactions.user_id', '=', 'users.id')
            ->groupBy('transactions.user_id')
            ->orderByDesc('total');

        if ($request->month) {
            $data = explode('-', $request->month);
            $query->whereMonth('transactions.created_at', $data[0])
                ->whereYear('transactions.created_at', $data[1]);
        } else {
            $currentMonth = Carbon::parse()->month;
            $query->whereMonth('transactions.created_at', $currentMonth);
        }
        $result = $query->get();
        return ApiResponse::success($result);
    }

    function financial_position(Request $request)
    {
        $query = DB::table('transactions')
            ->select(DB::raw('sum(amount) as balance, DATE(created_at) as date'))
            ->groupBy(DB::raw('DATE(created_at)'));

        $cashQuery = DB::table('cashes')
            ->select(DB::raw('sum(amount) as balance, DATE(created_at) as date'))
            ->groupBy(DB::raw('DATE(created_at)'));

        $floatBeforeQuery = Transaction::query();
        $cashBeforeQuery = Cash::query();

        if ($request->month) {
            $data = explode('-', $request->month);
            $startDate = Carbon::parse($data[1], $data[0])->startOfMonth()->format('Y-m-d');

            $query->whereYear('created_at', $data[1])->whereMonth('created_at', $data[0]);
            $cashQuery->whereMonth('created_at', $data[0])->whereYear('created_at', $data[1]);

            $floatBeforeQuery->whereDate('created_at', '<', $startDate);
            $cashBeforeQuery->whereDate('created_at', '<', $startDate);
        } else {
            $currentMonth = Carbon::parse()->month;
            $startDate = Carbon::parse()->firstOfMonth()->format('Y-m-d');

            $query->whereMonth('created_at', $currentMonth);
            $cashQuery->whereMonth('created_at', $currentMonth);

            $floatBeforeQuery->whereDate('created_at', '<', $startDate);
            $cashBeforeQuery->whereDate('created_at', '<', $startDate);
        }

        $transBalance = 0;
        $cashBalance = 0;
        $response = [];

        $transData = $query->get();
        $cashData = $cashQuery->get();

        $transBalance = $floatBeforeQuery->sum('amount');
        $cashBalance = $cashBeforeQuery->sum('amount');

        for ($i = 0; $i < $transData->count(); $i++) {
            $before = $transBalance + $cashBalance;
            $transBalance += $transData[$i]->balance;
            $cashBalance += $cashData[$i]->balance;

            $item = new FinancilPosition();
            $item->total = $transBalance + $cashBalance;
            $item->diff = ($transBalance + $cashBalance) - $before;
            $item->percentage = round((($transBalance + $cashBalance) - $before) / ($transBalance + $cashBalance) * 100, 2);
            $item->float = $transBalance;
            $item->cash = $cashBalance;
            $item->date = $cashData[$i]->date;

            $response[] = $item;
        }

        return ApiResponse::success($response);
    }

    function commissions(Request $request)
    {
        if (!auth()->user()->can('show_commission_report'))
            return ApiResponse::error(403);

        $year = $request->year ?: date('Y');

        $query = DB::table('commissions')
            ->select(DB::raw('MONTH(created_at) as month, sum(amount) as amount'))
            ->whereYear('created_at', $year);

        if ($request->network) {
            $query->where('network_id', $request->network);
        }


        $commissions = $query->groupBy('month')
            ->get()
            ->map(function ($item) {
                $item->amount = floatval($item->amount);
                $item->diff = $item->amount - $this->commissionBefore;
                $item->month = Carbon::parse()->month($item->month)->format('F');
                $item->percentage = $this->commissionBefore == 0
                    ? 100
                    : round($item->diff / $this->commissionBefore * 100, 2);

                $this->commissionBefore = $item->amount;
                return $item;
            });

        return ApiResponse::success($commissions);
    }

    function commissionsByNetwork(Request $request)
    {
        if (!auth()->user()->can('show_commission_report'))
            return ApiResponse::error(403);

        $month = date('m');
        $year = date('Y');

        if ($request->month) {
            $query = explode('-', $request->month);
            $month = $query[0];
            $year = $query[1];
        }

        $commissions = DB::table('commissions')
            ->select(
                'commissions.id',
                'networks.name as network',
                DB::raw('sum(amount) as amount')
            )
            ->rightJoin('networks', 'commissions.network_id', '=', 'networks.id')
            ->whereMonth('commissions.created_at', $month)
            ->whereYear('commissions.created_at', $year)
            ->groupBy('commissions.network_id')
            ->groupBy(DB::raw('MONTH(commissions.created_at)'))
            ->orderByDesc('amount')
            ->get();

        return ApiResponse::success([
            'networks' => $commissions,
            'total' => $commissions->sum('amount')
        ]);
    }

    function networkTransactions(Request $request)
    {
        if (!auth()->user()->can('show_transactions_report'))
            return ApiResponse::error(403);

        $month = date('m');
        $year = date('Y');

        if ($request->month) {
            $query = explode('-', $request->month);
            $month = $query[0];
            $year = $query[1];
        }

        $data = DB::table('transactions')
            ->select(
                'networks.name as network',
                DB::raw('count(*) as total'),
                DB::raw('SUM(CASE WHEN amount < 0 THEN 1 ELSE 0 END) AS deposit,
                SUM(CASE WHEN amount > 0 THEN 1 ELSE 0 END) AS withdrawal')
            )
            ->rightJoin('networks', 'transactions.network_id', '=', 'networks.id')
            ->whereMonth('transactions.created_at', $month)
            ->whereYear('transactions.created_at', $year)
            ->groupBy('transactions.network_id')
            ->orderByDesc('total')
            ->get()
            ->map(function ($item) {
                $item->deposit = intval($item->deposit);
                $item->withdrawal = intval($item->withdrawal);
                return $item;
            });

        return ApiResponse::success($data);
    }

    function profit(Request $request)
    {
        $year = $request->year ?: date('Y');

        $commissions = DB::table('commissions')
            ->select(DB::raw('MONTH(created_at) as month, sum(amount) as amount'))
            ->whereYear('created_at', $year)
            ->groupBy('month')
            ->get()
            ->keyBy('month');

        $expenses = DB::table('expenses')
            ->select(DB::raw('MONTH(expense_date) as month, sum(amount) as amount'))
            ->whereYear('expense_date', $year)
            ->where('for_shop', false)
            ->groupBy('month')
            ->get()
            ->keyBy('month');

        $merged = [];

        foreach (range(1, 12) as $month) {
            $merged[] = [
                'month' => $month,
                'commission' => $commissions->get($month)->amount ?? 0,
                'expenses' => $expenses->get($month)->amount ?? 0
            ];
        }

        $merged = array_filter($merged, function ($data) {
            return $data['commission'] > 0 || $data['expenses'] > 0;
        });

        return ApiResponse::success(array_values($merged));
    }
}

class FinancilPosition
{
    public $cash;
    public $float;
    public $total;
    public $diff;
    public $date;
    public $percentage;
}
