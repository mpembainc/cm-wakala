<?php

namespace App\Http\Controllers;

use App\Helpers\ApiResponse;
use App\Http\Resources\PermissionResource;
use App\Http\Resources\RoleResource;
use Illuminate\Http\Request;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class RoleController extends Controller
{
    function index()
    {
        $roles = Role::all();
        return ApiResponse::success(RoleResource::collection($roles));
    }

    function show($roleId)
    {
        $role = Role::findById($roleId, 'web');
        $permissions = $role->getAllPermissions();
        $unassignedPermissions = Permission::all()->whereNotIn('id', $permissions->pluck('id')->toArray())->values();

        return ApiResponse::success([
            'role' => new RoleResource($role),
            'assigned' => PermissionResource::collection($permissions),
            'unassigned' => PermissionResource::collection($unassignedPermissions)
        ]);
    }

    function store(Request $request)
    {
        $request->validate(['name' => 'required|string']);

        $role = Role::create(['name' => $request->name, 'guard_name' => 'web']);
        return ApiResponse::success(new RoleResource($role));
    }

    function update(Role $role, Request $request)
    {
        $request->validate(['name' => 'required|string']);
        $role->name = $request->name;
        $role->save();

        return ApiResponse::success(new RoleResource($role));
    }

    function givePermission(Request $request)
    {
        $role = Role::findById($request->role, 'web');
        $role->syncPermissions($request->permissions);

        return ApiResponse::success(['message' => 'success']);
    }
}
