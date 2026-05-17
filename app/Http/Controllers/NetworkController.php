<?php

namespace App\Http\Controllers;

use App\Helpers\ApiResponse;
use App\Models\Network;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class NetworkController extends Controller
{
    public function index()
    {
        if (!auth()->user()->can('list_networks'))
            return ApiResponse::error(403);

        $networks = Network::getBalance();

        return ApiResponse::success($networks);
    }

    public function show($id)
    {
        if (!auth()->user()->can('show_network'))
            return ApiResponse::error(403);

        $network = Network::find($id);
        if (!$network)
            return ApiResponse::error(404);

        $result = [
            "id" => $network->id,
            "name" => $network->name,
            "balance" => $network->transactions->sum('amount'),
            "createdAt" => $network->created_at,
        ];

        return ApiResponse::success($result);
    }

    public function store(Request $request)
    {
        if (!auth()->user()->can('add_network'))
            return ApiResponse::error(403);

        $network = new Network();
        $network->name = strtoupper($request->name);
        $network->save();

        return ApiResponse::success($network);
    }

    public function destroy($id)
    {
        if (!auth()->user()->can('delete_network'))
            return ApiResponse::error(403);

        $network = Network::find($id);
        if (!$network)
            return ApiResponse::error(404);
        $network->delete();

        return ApiResponse::success(['message' => 'deleted']);
    }

    public function update(Request $request, $id)
    {
        if (!auth()->user()->can('update_network'))
            return ApiResponse::error(403);

        $network = Network::find($id);
        if (!$network)
            return ApiResponse::error(404);

        $network->name = $request->name;
        $network->save();

        return ApiResponse::success($network);
    }
}
