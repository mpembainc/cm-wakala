<?php

namespace App\Http\Controllers;

use App\Http\Resources\ExpensesResource;
use App\Models\Cash;
use App\Models\Expense;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ExpenseController extends Controller
{
    public function index(Request $request)
    {
        $month = date('m');
        $year = date('Y');
        $query = Expense::query();

        if ($request->search) {
            $query->where('name', 'LIKE', "%{$request->search}%");
        }

        if ($request->month) {
            $data = explode('-', $request->month);
            if (count($data) === 2) {
                $month = $data[0];
                $year = $data[1];
            }
        }

        $expenses = $query->whereMonth('expense_date', $month)
            ->whereYear('expense_date', $year)
            ->orderByDesc('id')
            ->get();

        $user = auth()->user();
        $permissions = $user->hasRole('admin')
            ? \Spatie\Permission\Models\Permission::all()->pluck('name')
            : $user->getAllPermissions()->pluck('name');

        return Inertia::render('expenses/index', [
            'expenses' => ExpensesResource::collection($expenses),
            'filters' => [
                'search' => $request->search ?? '',
                'month' => $request->month ?? date('m-Y'),
            ],
            'user' => [
                'name' => $user->name,
                'permissions' => $permissions,
            ],
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'amount' => 'required|numeric|min:0.01',
            'expenseDate' => 'required|date',
        ]);

        $expense = new Expense();
        $expense->name = $request->name;
        $expense->amount = $request->amount;
        $expense->user_id = $request->user()->id;
        $expense->expense_date = $request->expenseDate;
        $expense->save();

        # Save Cash Transaction
        $cash = new Cash();
        $cash->amount = -$request->amount;
        $cash->remark = strtoupper($request->name);
        $cash->user_id = auth()->id();
        $cash->save();

        return redirect()->back()->with('success', 'Matumizi yamehifadhiwa kikamilifu.');
    }
}
