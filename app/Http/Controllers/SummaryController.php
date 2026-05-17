<?php

namespace App\Http\Controllers;

use App\Helpers\ApiResponse;
use App\Models\Cash;
use App\Models\Network;
use App\Models\Transaction;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class SummaryController extends Controller
{
    public function __construct()
    {
        $this->authorizeJson('view_dashboard');
    }

    public function index(Request $request)
    {
        $today = Carbon::parse(now())->format('Y-m-d');
        if ($request->filter) {
            $filter = $request->filter;
            $type = $request->type;

            if ($type == 'month')
                $transactions = Transaction::whereMonth('created_at', $filter)->get();
            if ($type == 'year')
                $transactions = Transaction::whereYear('created_at', $filter)->get();
            if ($type == 'day')
                $transactions = Transaction::whereDay('created_at', $filter)->get();
            if ($type == 'week' && $filter == 'current') {
                $startWeek = Carbon::parse(now())->startOfWeek()->format('Y-m-d');
                $endWeek = Carbon::parse(now())->endOfWeek()->format('Y-m-d');
                $transactions = Transaction::whereBetween('created_at', [$startWeek, $endWeek])->get();
            }
            if ($type == 'week' && $filter == 'last') {
                $startWeek = Carbon::parse(now())->subWeek()->startOfWeek()->format('Y-m-d');
                $endWeek = Carbon::parse(now())->subWeek()->endOfWeek()->format('Y-m-d');
                $transactions = Transaction::whereBetween('created_at', [$startWeek, $endWeek])->get();
            }
        } else {
            $transactions = Transaction::whereDate('created_at', $today)->get();
        }

        $transactionCount = $transactions->count();
        $floatBalance = Transaction::sum('amount');
        $networks = Network::count();
        $cash = Cash::sum('amount');

        return [
            'transactionCount' => $transactionCount,
            'floatBalance' => floatval($floatBalance),
            'networkCount' => $networks,
            'cashBalance' => floatval($cash),
        ];
    }

    public function transactionSummary(Request $request)
    {
        $month = date('m');
        $year = date('Y');
        $type = $request->type ?: 'daily';

        if ($request->filter) {
            $data = explode('-', $request->filter);
            $month = $data[0];
            $year = $data[1];
        }

        $rawQuery = $type == 'daily' ? "DATE" : "MONTH";
        $rawQuery .= "(created_at) as date,
            SUM(CASE WHEN amount < 0 THEN 1 ELSE 0 END) AS deposit,
            SUM(CASE WHEN amount > 0 THEN 1 ELSE 0 END) AS withdrawal";

        $query = DB::table('transactions')->select(DB::raw($rawQuery));
        if ($type == 'daily') {
            $query->whereMonth('transactions.created_at', $month);
        }

        $data = $query->whereYear('transactions.created_at', $year)
            ->groupBy('date')
            ->orderBy('date')
            ->get();
        return ApiResponse::success($data);
    }

    public function amountUsedSummary(Request $request)
    {
        $month = date('m');
        $year = date('Y');
        $type = $request->type ?: 'daily';

        if ($request->filter) {
            $data = explode('-', $request->filter);
            $month = $data[0];
            $year = $data[1];
        }

        $rawQuery = $type == 'daily' ? "DATE" : "MONTH";
        $rawQuery .= "(created_at) as date,
            SUM(CASE WHEN amount < 0 THEN ABS(amount) ELSE 0 END) AS deposit,
            SUM(CASE WHEN amount > 0 THEN amount ELSE 0 END) AS withdrawal";

        $query = DB::table('transactions')->select(DB::raw($rawQuery));
        if ($type == 'daily') {
            $query->whereMonth('transactions.created_at', $month);
        }

        $data = $query->whereYear('transactions.created_at', $year)
            ->groupBy('date')
            ->orderBy('date')
            ->get();
        return ApiResponse::success($data);
    }
}
