<?php

namespace App\Helpers;

class ApiResponse
{
    public static function success($data, $code = 200)
    {
        return response()->json([
            'status' => 'success',
            'data' => $data
        ], $code);
    }

    public static function error($code = 500, $message = null)
    {
        $errors = [
            '404' => 'Resource not found',
            '403' => 'You do not have the required authorization.',
            '400' => 'Data you provided was invalid.',
            '500' => 'Internal server error.',
        ];

        return response()->json([
            'status' => 'error',
            'message' => $message ?: $errors[$code],
            'code' => $code
        ], $code);
    }
}
