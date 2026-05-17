<?php

namespace App\Http\Controllers;

use App\Helpers\ApiResponse;
use App\Http\Resources\UserResource;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Role;

class UserController extends Controller
{
    public function index()
    {
        if (!auth()->user()->can('list_users'))
            return ApiResponse::error(403);

        $users = User::with('roles')->get();
        return ApiResponse::success(UserResource::collection($users));
    }

    public function store(Request $request)
    {
        if (!auth()->user()->can('add_user'))
            return ApiResponse::error(403);

        $user = new User();
        $user->name = $request->name;
        $user->username = $request->username;
        $user->email = $request->email;
        $user->is_admin = $request->isAdmin;
        $user->password = Hash::make($request->password);
        $user->save();

        $user->assignRole($request->role);
        return ApiResponse::success(new UserResource($user));
    }

    public function update(Request $request, $id)
    {
        if (!auth()->user()->can('update_user'))
            return ApiResponse::error(403);

        $user = User::find($id);
        if (!$user) return ApiResponse::error('404');

        $user->name = $request->name;
        $user->username = $request->username;
        $user->email = $request->email;
        $user->is_admin = $request->isAdmin;
        $user->save();

        return ApiResponse::success(new UserResource($user));
    }

    function assignRole(Request $request)
    {
        $user = User::find($request->user);
        $role = Role::findById($request->role, 'web');
        $user->syncRoles($role);

        return ApiResponse::success(['message' => 'success']);
    }

    public function reset_password(Request $request)
    {
        $request->validate([
            'user_id' => 'required|exists:users,id',
        ]);

        if (!auth()->user()->can('reset_password')) {
            return ApiResponse::error(403);
        }

        $user = User::find($request->user_id);
        if (!$user) return ApiResponse::error('404');

        $firstName = explode(' ', $user->name)[0];
        $user->password = Hash::make(strtolower($firstName) . "@1234");
        $user->save();

        return ApiResponse::success(['message' => 'success']);
    }
}
