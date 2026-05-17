<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\CashController;
use App\Http\Controllers\CommissionController;
use App\Http\Controllers\DebtorController;
use App\Http\Controllers\ExpenseController;
use App\Http\Controllers\LoanRepaymentController;
use App\Http\Controllers\LoanTransactionController;
use App\Http\Controllers\NetworkController;
use App\Http\Controllers\PermissionController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\RoleController;
use App\Http\Controllers\ShopTransactionController;
use App\Http\Controllers\SummaryController;
use App\Http\Controllers\TransactionController;
use App\Http\Controllers\UserController;
use Illuminate\Support\Facades\Route;

Route::post('auth/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('auth/change-password', [AuthController::class, 'change_password']);
    Route::post('auth/logout', [AuthController::class, 'logout']);

    #Basic Functionality
    Route::apiResource('networks', NetworkController::class);
    Route::apiResource('transactions', TransactionController::class);
    Route::get('accounts/search', [TransactionController::class, 'search']);

    Route::apiResource('cash', CashController::class)->only(['index', 'store']);
    Route::apiResource('users', UserController::class);
    Route::apiResource('expenses', ExpenseController::class)->only(['index', 'store']);
    Route::apiResource('commissions', CommissionController::class)->only(['index', 'store']);

    #Security
    Route::apiResource('permissions', PermissionController::class)->only('index');
    Route::apiResource('roles', RoleController::class);
    Route::post('role-permissions', [RoleController::class, 'givePermission']);
    Route::post('user-role', [UserController::class, 'assignRole']);
    Route::post('reset-password', [UserController::class, 'reset_password']);

    Route::get('cash/balance', [CashController::class, 'balance']);
    Route::get('summary', [SummaryController::class, 'index']);

    // Report
    Route::prefix('report')->group(function () {
        Route::get('user-transactions', [ReportController::class, 'user_transactions']);
        Route::get('financial-position', [ReportController::class, 'financial_position']);
        Route::get('transaction-types', [SummaryController::class, 'transactionSummary']);
        Route::get('amount-used', [SummaryController::class, 'amountUsedSummary']);
        Route::get('commissions', [ReportController::class, 'commissions']);
        Route::get('network-commissions', [ReportController::class, 'commissionsByNetwork']);
        Route::get('network-transactions', [ReportController::class, 'networkTransactions']);
        Route::get('profit', [ReportController::class, 'profit']);
    });
});
