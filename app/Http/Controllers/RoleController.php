<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Inertia\Inertia;

class RoleController extends Controller
{
    public function index()
    {
        if (!auth()->user()->can('list_roles')) {
            abort(403);
        }

        $roles = Role::all();
        $user = auth()->user();
        $permissions = $user->hasRole('admin')
            ? Permission::all()->pluck('name')
            : $user->getAllPermissions()->pluck('name');

        return Inertia::render('roles/index', [
            'roles' => $roles,
            'user' => [
                'name' => $user->name,
                'permissions' => $permissions,
            ],
        ]);
    }

    public function show($roleId)
    {
        if (!auth()->user()->can('list_roles')) {
            abort(403);
        }

        $role = Role::findById($roleId, 'web');
        $permissions = $role->getAllPermissions();
        $unassignedPermissions = Permission::all()->whereNotIn('id', $permissions->pluck('id')->toArray())->values();

        $user = auth()->user();
        $userPermissions = $user->hasRole('admin')
            ? Permission::all()->pluck('name')
            : $user->getAllPermissions()->pluck('name');

        return Inertia::render('roles/permissions', [
            'role' => $role,
            'assigned' => $permissions,
            'unassigned' => $unassignedPermissions,
            'user' => [
                'name' => $user->name,
                'permissions' => $userPermissions,
            ],
        ]);
    }

    public function store(Request $request)
    {
        if (!auth()->user()->can('add_user')) {
            abort(403);
        }

        $request->validate(['name' => 'required|string|max:255|unique:roles,name']);

        Role::create(['name' => strtolower($request->name), 'guard_name' => 'web']);
        
        return redirect()->back()->with('success', 'Jukumu jipya limesajiliwa kikamilifu.');
    }

    public function update($roleId, Request $request)
    {
        if (!auth()->user()->can('add_user')) {
            abort(403);
        }

        $request->validate(['name' => 'required|string|max:255|unique:roles,name,' . $roleId]);
        
        $role = Role::findById($roleId, 'web');
        $role->name = strtolower($request->name);
        $role->save();

        return redirect()->back()->with('success', 'Jukumu limesasishwa kikamilifu.');
    }

    public function givePermission(Request $request)
    {
        if (!auth()->user()->can('add_user')) {
            abort(403);
        }

        $request->validate([
            'role' => 'required|exists:roles,id',
            'permissions' => 'nullable|array',
        ]);

        $role = Role::findById($request->role, 'web');
        
        // Sync permissions
        $permissions = Permission::whereIn('id', $request->permissions ?? [])->get();
        $role->syncPermissions($permissions);

        return redirect()->route('roles.index')->with('success', 'Ruhusa za jukumu zimesasishwa kikamilifu.');
    }
}
