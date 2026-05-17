<?php

namespace App\Http\Controllers;

use App\Helpers\ApiResponse;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Foundation\Validation\ValidatesRequests;
use Illuminate\Support\Facades\Gate;

abstract class Controller
{
    use AuthorizesRequests, ValidatesRequests;

    protected function authorizeAny(array $abilities) {
        if (!Gate::any($abilities)) {
            abort(403, 'This action is unauthorized.');
        }
    }

    protected function authorizeJson($abilities) {
        $abilities = is_array($abilities) ? $abilities : [$abilities];

        if (!Gate::any($abilities)) {
            return ApiResponse::error(403);
        }

        return true;
    }
}
