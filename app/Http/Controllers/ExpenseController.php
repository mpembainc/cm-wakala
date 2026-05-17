<?php

namespace App\Http\Controllers;

use App\Helpers\ApiResponse;
use App\Http\Resources\ExpensesResource;
use App\Models\Cash;
use App\Models\Expense;
use Illuminate\Http\Request;

class ExpenseController extends Controller
{
    public function index(Request $request)
    {
        $month = date('m');
        $year = date('Y');
        $query = Expense::query();
        $balance = 0;

        if ($request->search) $query->where('name', 'LIKE', "%{$request->search}%");

        if ($request->month) {
            $data = explode('-', $request->month);
            $month = $data[0];
            $year = $data[1];
        }

        if ($request->expense && $request->expense == 'shop') {
            $query->where('for_shop', true);

            $balance = $query->clone()
                ->whereYear('expense_date', '>=', '2025')
                ->sum('amount');
        } else {
            $query->where(function ($query) {
                $query->where('for_shop', false)
                    ->orWhereNull('for_shop');
            });
        }

        $expenses = $query->whereMonth('expense_date', $month)
            ->whereYear('expense_date', $year)
            ->orderByDesc('id')
            ->get();

        return ApiResponse::success([
            'expenses' => ExpensesResource::collection($expenses),
            'balance' => $balance
        ]);
    }

    public function store(Request $request)
    {
        $expense = new Expense();
        $expense->name = $request->name;
        $expense->amount = $request->amount;
        $expense->user_id = $request->user()->id;
        $expense->for_shop = $request->forShop;
        $expense->expense_date = $request->expenseDate;
        $expense->save();

        # Save Cash Transaction
        $cash = new Cash();
        $cash->amount = -$request->amount;
        $cash->remark = strtoupper($request->name);
        $cash->user_id = auth()->id();
        $cash->save();

        return ApiResponse::success($expense);
    }
}
