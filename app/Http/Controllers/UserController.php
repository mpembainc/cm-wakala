<?php

namespace App\Http\Controllers;

use App\Http\Resources\UserResource;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Role;
use Inertia\Inertia;

class UserController extends Controller
{
    public function index()
    {
        if (!auth()->user()->can('list_users')) {
            abort(403);
        }

        $users = User::with('roles')->get();
        $roles = Role::all();

        $currentUser = auth()->user();
        $permissions = $currentUser->hasRole('admin')
            ? \Spatie\Permission\Models\Permission::all()->pluck('name')
            : $currentUser->getAllPermissions()->pluck('name');

        return Inertia::render('users/index', [
            'users' => UserResource::collection($users),
            'roles' => $roles,
            'user' => [
                'name' => $currentUser->name,
                'permissions' => $permissions,
            ],
        ]);
    }

    public function store(Request $request)
    {
        if (!auth()->user()->can('add_user')) {
            abort(403);
        }

        $request->validate([
            'name' => 'required|string|max:255',
            'username' => 'required|string|max:255|unique:users,username',
            'email' => 'required|string|email|max:255|unique:users,email',
            'password' => 'required|string|min:6',
            'role' => 'required|string|exists:roles,name',
            'isAdmin' => 'nullable|boolean',
        ]);

        $user = new User();
        $user->name = $request->name;
        $user->username = $request->username;
        $user->email = $request->email;
        $user->is_admin = $request->isAdmin ?? false;
        $user->password = Hash::make($request->password);
        $user->save();

        $user->assignRole($request->role);
        
        return redirect()->back()->with('success', 'Mtumiaji mpya amesajiliwa kikamilifu.');
    }

    public function update(Request $request, $id)
    {
        if (!auth()->user()->can('update_user')) {
            abort(403);
        }

        $request->validate([
            'name' => 'required|string|max:255',
            'username' => 'required|string|max:255|unique:users,username,' . $id,
            'email' => 'required|string|email|max:255|unique:users,email,' . $id,
            'isAdmin' => 'nullable|boolean',
        ]);

        $user = User::find($id);
        if (!$user) {
            abort(404);
        }

        $user->name = $request->name;
        $user->username = $request->username;
        $user->email = $request->email;
        $user->is_admin = $request->isAdmin ?? false;
        $user->save();

        return redirect()->back()->with('success', 'Taarifa za mtumiaji zimesasishwa.');
    }

    public function assignRole(Request $request)
    {
        if (!auth()->user()->can('add_user')) {
            abort(403);
        }

        $request->validate([
            'user' => 'required|exists:users,id',
            'role' => 'required|exists:roles,id',
        ]);

        $user = User::find($request->user);
        $role = Role::findById($request->role, 'web');
        $user->syncRoles($role);

        return redirect()->back()->with('success', 'Jukumu la mtumiaji limesasishwa.');
    }

    public function reset_password(Request $request)
    {
        $request->validate([
            'user_id' => 'required|exists:users,id',
        ]);

        if (!auth()->user()->can('reset_password')) {
            abort(403);
        }

        $user = User::find($request->user_id);
        if (!$user) {
            abort(404);
        }

        $firstName = explode(' ', $user->name)[0];
        $user->password = Hash::make(strtolower($firstName) . "@1234");
        $user->save();

        return redirect()->back()->with('success', 'Nenosiri la mtumiaji limewekwa upya.');
    }
}
