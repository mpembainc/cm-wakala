<?php

namespace App\Http\Controllers;

use App\Models\Cash;
use App\Models\Network;
use App\Models\Transaction;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Spatie\Permission\Models\Permission;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $filter = $request->filter;
        $today  = Carbon::today()->toDateString();

        $query = Transaction::query();

        match ($filter) {
            'week'  => $query->whereBetween('created_at', [
                Carbon::now()->startOfWeek()->toDateString(),
                Carbon::now()->endOfWeek()->toDateString(),
            ]),
            'month' => $query->whereMonth('created_at', now()->month)
                             ->whereYear('created_at', now()->year),
            'year'  => $query->whereYear('created_at', now()->year),
            default => $query->whereDate('created_at', $today),
        };

        $user = Auth::user();

        return Inertia::render('dashboard/index', [
            'filter'  => $filter ?? '',
            'summary' => [
                'transactionCount' => $query->count(),
                'floatBalance'     => floatval(Transaction::sum('amount')),
                'networkCount'     => Network::count(),
                'cashBalance'      => floatval(Cash::sum('amount')),
            ],
            'user' => [
                'name'        => $user->name,
                'permissions' => $user->hasRole('admin')
                    ? Permission::all()->pluck('name')
                    : $user->getAllPermissions()->pluck('name'),
            ],
        ]);
    }
}
