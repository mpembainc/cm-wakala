<?php

namespace App\Http\Controllers;

use App\Http\Resources\CommissionResource;
use App\Models\Commission;
use App\Models\Network;
use App\Models\Transaction;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CommissionController extends Controller
{
    public function index(Request $request)
    {
        if (!auth()->user()->can('view_commissions')) {
            abort(403);
        }

        $month = date('m');
        $year = date('Y');

        if ($request->month) {
            $data = explode('-', $request->month);
            if (count($data) === 2) {
                $month = $data[0];
                $year = $data[1];
            }
        }

        $commissions = Commission::with(['network', 'user'])
            ->whereMonth('created_at', $month)
            ->whereYear('created_at', $year)
            ->orderByDesc('id')
            ->get();

        $networks = Network::orderBy('name')->get(['id', 'name']);

        $user = auth()->user();
        $permissions = $user->hasRole('admin')
            ? \Spatie\Permission\Models\Permission::all()->pluck('name')
            : $user->getAllPermissions()->pluck('name');

        return Inertia::render('commissions/index', [
            'commissions' => CommissionResource::collection($commissions),
            'networks' => $networks,
            'balance' => intval($commissions->sum('amount')),
            'filters' => [
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
        if (!auth()->user()->can('add_commission')) {
            abort(403);
        }

        $request->validate([
            'networkId' => 'required|exists:networks,id',
            'amount' => 'required|numeric|min:0.01',
            'remark' => 'nullable|string|max:255',
        ]);

        $commission = new Commission();
        $commission->network_id = $request->networkId;
        $commission->amount = $request->amount;
        $commission->remark = strtoupper($request->remark ?? 'COMMISSION DEPOSIT');
        $commission->user_id = auth()->id();
        $commission->save();

        # Save Network Transaction
        $transaction = new Transaction();
        $transaction->network_id = $request->networkId;
        $transaction->account_number = "COMMISSION";
        $transaction->account_name = "COMMISSION";
        $transaction->amount = $request->amount;
        $transaction->customer = "COMMISSION";
        $transaction->user_id = auth()->id();
        $transaction->save();

        return redirect()->back()->with('success', 'Commission imehifadhiwa kikamilifu.');
    }
}