<?php

namespace App\Http\Controllers;

use App\Helpers\ApiResponse;
use App\Http\Resources\PermissionResource;
use Illuminate\Http\Request;
use Spatie\Permission\Models\Permission;

class PermissionController extends Controller
{
    function index()
    {
        $permissions = Permission::all();
        return ApiResponse::success(PermissionResource::collection($permissions));
    }
}
