<?php

namespace App\Http\Controllers;

use App\Helpers\ApiResponse;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Permission;

class AuthController extends Controller
{
    function login(Request $request)
    {
        $credentials = $request->only(['username', 'password']);
        if (!auth()->attempt($credentials)) {
            return ApiResponse::error(401, 'No user with provided credentials');
        }

        $user = auth()->user();

        $result = [
            'token' => $user->createToken('aecoToken')->plainTextToken,
            'user' => [
                'name' => $user->name,
                'permissions' => $user->hasRole('admin')
                    ? Permission::all()->pluck('name')
                    : $user->getAllPermissions()->pluck('name')
            ]
        ];

        return $result;
    }

    function change_password(Request $request)
    {
        $user = User::find(auth()->id());
        $isSame = Hash::check($request->oldPassword, $user->password);

        if (!$isSame)
            return ApiResponse::error(400, "No user matching entered password");
        $user->password = $request->newPassword;
        $user->save();

        return ApiResponse::success(['message' => 'Password changed']);
    }

    function logout()
    {
        $user = auth()->user();

        $user->tokens()->delete();
        return ApiResponse::success(['status' => true]);
    }
}
