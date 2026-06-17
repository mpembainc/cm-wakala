<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use App\Models\Transaction;
use App\Models\Cash;
use Carbon\Carbon;

class ReportViewController extends Controller
{
    private int $commissionBefore = 0;

    public function user_transactions(Request $request)
    {
        if (!auth()->user()->can('show_user_transactions_report')) {
            abort(403);
        }

        $month = $request->query('month', Carbon::now()->format('Y-m'));
        $parsed = Carbon::parse($month);

        $result = DB::table('transactions')
            ->select('users.id as userId', 'users.name as username', DB::raw('count(*) as total'))
            ->join('users', 'transactions.user_id', '=', 'users.id')
            ->whereMonth('transactions.created_at', $parsed->month)
            ->whereYear('transactions.created_at', $parsed->year)
            ->groupBy('transactions.user_id')
            ->orderByDesc('total')
            ->get();

        return Inertia::render('reports/UserTransactions', [
            'reportData' => $result,
            'selectedMonth' => $month,
            'user' => [
                'name' => auth()->user()->name,
                'permissions' => auth()->user()->hasRole('admin')
                    ? \Spatie\Permission\Models\Permission::all()->pluck('name')
                    : auth()->user()->getAllPermissions()->pluck('name')
            ]
        ]);
    }

    public function financial_position(Request $request)
    {
        if (!auth()->user()->can('show_financial_position_report')) {
            abort(403);
        }

        $month = $request->query('month', Carbon::now()->format('Y-m'));
        $parsed = Carbon::parse($month);

        $query = DB::table('transactions')
            ->select(DB::raw('sum(amount) as balance, DATE(created_at) as date'))
            ->whereYear('created_at', $parsed->year)
            ->whereMonth('created_at', $parsed->month)
            ->groupBy(DB::raw('DATE(created_at)'))
            ->orderBy('date');

        $cashQuery = DB::table('cashes')
            ->select(DB::raw('sum(amount) as balance, DATE(created_at) as date'))
            ->whereYear('created_at', $parsed->year)
            ->whereMonth('created_at', $parsed->month)
            ->groupBy(DB::raw('DATE(created_at)'))
            ->orderBy('date');

        $startDate = $parsed->copy()->startOfMonth()->format('Y-m-d');
        
        $floatBeforeQuery = Transaction::whereDate('created_at', '<', $startDate);
        $cashBeforeQuery = Cash::whereDate('created_at', '<', $startDate);

        $transData = $query->get()->keyBy('date');
        $cashData = $cashQuery->get()->keyBy('date');

        $transBalance = $floatBeforeQuery->sum('amount');
        $cashBalance = $cashBeforeQuery->sum('amount');

        $daysInMonth = $parsed->daysInMonth;
        $today = Carbon::today();
        
        $limitDay = ($parsed->year == $today->year && $parsed->month == $today->month) 
            ? $today->day 
            : $daysInMonth;

        $response = [];
        for ($day = 1; $day <= $limitDay; $day++) {
            $currentDate = $parsed->copy()->day($day)->format('Y-m-d');
            
            $transDayBalance = $transData->get($currentDate)->balance ?? 0;
            $cashDayBalance = $cashData->get($currentDate)->balance ?? 0;

            $before = $transBalance + $cashBalance;
            $transBalance += $transDayBalance;
            $cashBalance += $cashDayBalance;

            $total = $transBalance + $cashBalance;
            $diff = $total - $before;
            $percentage = $total == 0 ? 0 : round(($diff / $total) * 100, 2);

            $response[] = [
                'date' => $currentDate,
                'float' => floatval($transBalance),
                'cash' => floatval($cashBalance),
                'total' => floatval($total),
                'diff' => floatval($diff),
                'percentage' => $percentage,
            ];
        }

        $response = array_reverse($response);

        return Inertia::render('reports/FinancialPosition', [
            'reportData' => $response,
            'selectedMonth' => $month,
            'user' => [
                'name' => auth()->user()->name,
                'permissions' => auth()->user()->hasRole('admin')
                    ? \Spatie\Permission\Models\Permission::all()->pluck('name')
                    : auth()->user()->getAllPermissions()->pluck('name')
            ]
        ]);
    }

    public function commissions(Request $request)
    {
        if (!auth()->user()->can('show_commission_report')) {
            abort(403);
        }

        $year = $request->query('year', date('Y'));
        
        $commissions = DB::table('commissions')
            ->select(DB::raw('MONTH(created_at) as month, sum(amount) as amount'))
            ->whereYear('created_at', $year)
            ->groupBy('month')
            ->orderBy('month')
            ->get();

        $commissionBefore = 0;
        $response = [];

        foreach (range(1, 12) as $mNum) {
            $commMonth = $commissions->firstWhere('month', $mNum);
            $amount = $commMonth ? floatval($commMonth->amount) : 0;
            
            if ($amount > 0 || ($year == date('Y') && $mNum <= date('n'))) {
                $diff = $amount - $commissionBefore;
                $percentage = $commissionBefore == 0 
                    ? ($amount > 0 ? 100 : 0) 
                    : round($diff / $commissionBefore * 100, 2);

                $response[] = [
                    'month_number' => $mNum,
                    'month' => Carbon::create()->month($mNum)->format('F'),
                    'amount' => $amount,
                    'diff' => $diff,
                    'percentage' => $percentage,
                ];

                $commissionBefore = $amount;
            }
        }

        $response = array_reverse($response);

        return Inertia::render('reports/Commissions', [
            'reportData' => $response,
            'selectedYear' => $year,
            'user' => [
                'name' => auth()->user()->name,
                'permissions' => auth()->user()->hasRole('admin')
                    ? \Spatie\Permission\Models\Permission::all()->pluck('name')
                    : auth()->user()->getAllPermissions()->pluck('name')
            ]
        ]);
    }

    public function profit(Request $request)
    {
        if (!auth()->user()->can('show_commission_report')) {
            abort(403);
        }

        $year = $request->query('year', date('Y'));

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

        $response = [];
        foreach (range(1, 12) as $mNum) {
            $commAmount = $commissions->get($mNum)->amount ?? 0;
            $expAmount = $expenses->get($mNum)->amount ?? 0;

            if ($commAmount > 0 || $expAmount > 0 || ($year == date('Y') && $mNum <= date('n'))) {
                $response[] = [
                    'month_number' => $mNum,
                    'month' => Carbon::create()->month($mNum)->format('F'),
                    'commission' => floatval($commAmount),
                    'expenses' => floatval($expAmount),
                    'profit' => floatval($commAmount) - floatval($expAmount),
                ];
            }
        }

        $response = array_reverse($response);

        return Inertia::render('reports/Profit', [
            'reportData' => $response,
            'selectedYear' => $year,
            'user' => [
                'name' => auth()->user()->name,
                'permissions' => auth()->user()->hasRole('admin')
                    ? \Spatie\Permission\Models\Permission::all()->pluck('name')
                    : auth()->user()->getAllPermissions()->pluck('name')
            ]
        ]);
    }

    public function network_commissions(Request $request)
    {
        if (!auth()->user()->can('show_commission_report')) {
            abort(403);
        }

        $month = $request->query('month', date('Y-m'));
        $parsed = Carbon::parse($month);

        $commissions = DB::table('commissions')
            ->select(
                'networks.name as network',
                DB::raw('SUM(commissions.amount) as amount')
            )
            ->rightJoin('networks', 'commissions.network_id', '=', 'networks.id')
            ->whereMonth('commissions.created_at', $parsed->month)
            ->whereYear('commissions.created_at', $parsed->year)
            ->groupBy('networks.name')
            ->orderByDesc('amount')
            ->get();

        return Inertia::render('reports/NetworkCommissions', [
            'reportData' => $commissions,
            'selectedMonth' => $month,
            'user' => [
                'name' => auth()->user()->name,
                'permissions' => auth()->user()->hasRole('admin')
                    ? \Spatie\Permission\Models\Permission::all()->pluck('name')
                    : auth()->user()->getAllPermissions()->pluck('name')
            ]
        ]);
    }

    public function network_transactions(Request $request)
    {
        if (!auth()->user()->can('show_transactions_report')) {
            abort(403);
        }

        $month = $request->query('month', date('Y-m'));
        $parsed = Carbon::parse($month);

        $data = DB::table('transactions')
            ->select(
                'networks.name as network',
                DB::raw('count(transactions.id) as total'),
                DB::raw('SUM(CASE WHEN transactions.amount < 0 THEN 1 ELSE 0 END) AS deposit'),
                DB::raw('SUM(CASE WHEN transactions.amount > 0 THEN 1 ELSE 0 END) AS withdrawal')
            )
            ->rightJoin('networks', 'transactions.network_id', '=', 'networks.id')
            ->whereMonth('transactions.created_at', $parsed->month)
            ->whereYear('transactions.created_at', $parsed->year)
            ->groupBy('networks.name')
            ->orderByDesc('total')
            ->get()
            ->map(function ($item) {
                $item->total = intval($item->total);
                $item->deposit = intval($item->deposit ?? 0);
                $item->withdrawal = intval($item->withdrawal ?? 0);
                return $item;
            });

        return Inertia::render('reports/NetworkTransactions', [
            'reportData' => $data,
            'selectedMonth' => $month,
            'user' => [
                'name' => auth()->user()->name,
                'permissions' => auth()->user()->hasRole('admin')
                    ? \Spatie\Permission\Models\Permission::all()->pluck('name')
                    : auth()->user()->getAllPermissions()->pluck('name')
            ]
        ]);
    }

    public function deposit_withdrawal(Request $request)
    {
        if (!auth()->user()->can('show_transaction_summary')) {
            abort(403);
        }

        $type = $request->query('type', 'daily');
        $month = $request->query('month', date('Y-m'));
        $year = $request->query('year', date('Y'));

        $parsed = Carbon::parse($month);

        $rawQuery = $type == 'daily' ? "DATE" : "MONTH";
        $rawQuery .= "(created_at) as date,
            SUM(CASE WHEN amount < 0 THEN ABS(amount) ELSE 0 END) AS deposit,
            SUM(CASE WHEN amount > 0 THEN amount ELSE 0 END) AS withdrawal";

        $query = DB::table('transactions')->select(DB::raw($rawQuery));
        if ($type == 'daily') {
            $query->whereMonth('transactions.created_at', $parsed->month);
            $query->whereYear('transactions.created_at', $parsed->year);
        } else {
            $query->whereYear('transactions.created_at', $year);
        }

        $data = $query->groupBy('date')
            ->orderBy('date')
            ->get();

        return Inertia::render('reports/DepositWithdrawal', [
            'reportData' => $data,
            'selectedMonth' => $month,
            'selectedYear' => $year,
            'filterType' => $type,
            'user' => [
                'name' => auth()->user()->name,
                'permissions' => auth()->user()->hasRole('admin')
                    ? \Spatie\Permission\Models\Permission::all()->pluck('name')
                    : auth()->user()->getAllPermissions()->pluck('name')
            ]
        ]);
    }
}
