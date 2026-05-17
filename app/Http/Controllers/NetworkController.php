<?php

namespace App\Http\Controllers;

use App\Models\Network;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Spatie\Permission\Models\Permission;

class NetworkController extends Controller
{
    public function index()
    {
        if (!auth()->user()->can('list_networks')) {
            abort(403);
        }

        $user = Auth::user();
        $permissions = $user->hasRole('admin')
            ? Permission::all()->pluck('name')
            : $user->getAllPermissions()->pluck('name');

        return Inertia::render('networks/index', [
            'networks' => Network::getBalance()->map(function ($network) {
                return [
                    'id' => $network->id,
                    'name' => $network->name,
                    'balance' => floatval($network->balance),
                    'createdAt' => $network->createdAt,
                ];
            }),
            'user' => [
                'name' => $user->name,
                'permissions' => $permissions,
            ],
        ]);
    }

    public function store(Request $request)
    {
        if (!auth()->user()->can('add_network')) {
            abort(403);
        }

        $request->validate([
            'name' => 'required|string|max:50|unique:networks,name',
        ]);

        $network = new Network();
        $network->name = strtoupper($request->name);
        $network->save();

        return redirect()->back();
    }

    public function update(Request $request, $id)
    {
        if (!auth()->user()->can('update_network')) {
            abort(403);
        }

        $request->validate([
            'name' => 'required|string|max:50|unique:networks,name,' . $id,
        ]);

        $network = Network::findOrFail($id);
        $network->name = strtoupper($request->name);
        $network->save();

        return redirect()->back();
    }

    public function destroy($id)
    {
        if (!auth()->user()->can('delete_network')) {
            abort(403);
        }

        $network = Network::findOrFail($id);
        $network->delete();

        return redirect()->back();
    }
}
