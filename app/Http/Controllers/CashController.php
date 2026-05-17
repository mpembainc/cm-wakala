<?php

namespace App\Http\Controllers;

use App\Models\Cash;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Spatie\Permission\Models\Permission;

class CashController extends Controller
{
    public function index(Request $request)
    {
        if (!auth()->user()->can('view_cash_transactions')) {
            abort(403);
        }

        $where = [];
        if ($request->userId) {
            $where['user_id'] = $request->userId;
        }

        $cashQuery = Cash::with('user')->where($where);

        if ($request->startDate && !$request->endDate) {
            $cashQuery->whereDate('created_at', $request->startDate);
        }
        if (!$request->startDate && $request->endDate) {
            $cashQuery->whereDate('created_at', $request->endDate);
        }
        if ($request->startDate && $request->endDate) {
            $cashQuery->whereBetween('created_at', [
                Carbon::parse($request->startDate)->startOfDay(),
                Carbon::parse($request->endDate)->endOfDay(),
            ]);
        }

        // If no filter parameters are passed, default to showing today's transactions!
        if (empty($request->startDate) && empty($request->endDate) && empty($request->userId)) {
            $cashQuery->whereDate('created_at', Carbon::today());
        }

        $cashes = $cashQuery->orderByDesc('id')->get();

        $user = Auth::user();
        $permissions = $user->hasRole('admin')
            ? Permission::all()->pluck('name')
            : $user->getAllPermissions()->pluck('name');

        $users = [];
        if ($user->can('list_users')) {
            $users = User::orderBy('name')->get(['id', 'name']);
        }

        return Inertia::render('cash/index', [
            'transactions' => $cashes->map(function ($cash) {
                return [
                    'id' => $cash->id,
                    'amount' => floatval($cash->amount),
                    'transactionId' => $cash->transaction_id,
                    'reference' => $cash->reference,
                    'remark' => $cash->remark,
                    'createdAt' => $cash->created_at->toIso8601String(),
                    'createdBy' => $cash->user->name ?? 'SYSTEM',
                ];
            }),
            'balance' => floatval(Cash::getBalance()),
            'users' => $users,
            'filters' => [
                'startDate' => $request->startDate ?? '',
                'endDate' => $request->endDate ?? '',
                'userId' => $request->userId ?? '',
            ],
            'user' => [
                'name' => $user->name,
                'permissions' => $permissions,
            ],
        ]);
    }

    public function store(Request $request)
    {
        if (!auth()->user()->can('add_cash_transaction')) {
            abort(403);
        }

        $request->validate([
            'amount' => 'required|numeric',
            'description' => 'required|string|max:255',
        ]);

        $cash = new Cash();
        $cash->amount = $request->amount;
        $cash->remark = strtoupper($request->description);
        $cash->user_id = auth()->id();
        $cash->save();

        return redirect()->back();
    }
}
