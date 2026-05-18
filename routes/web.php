<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\LoginController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\NetworkController;
use App\Http\Controllers\CashController;
use App\Http\Controllers\TransactionController;
use App\Http\Controllers\ExpenseController;
use App\Http\Controllers\UserController;

// Redirect root to dashboard
Route::get('/', fn() => redirect('/dashboard'));

// Auth
Route::get('/login', [LoginController::class, 'show'])->name('login');
Route::post('/login', [LoginController::class, 'store']);
Route::post('/logout', [LoginController::class, 'destroy'])->name('logout');

// Protected routes
Route::middleware('auth')->group(function () {
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

    Route::get('/networks', [NetworkController::class, 'index'])->name('networks.index');
    Route::post('/networks', [NetworkController::class, 'store'])->name('networks.store');
    Route::put('/networks/{id}', [NetworkController::class, 'update'])->name('networks.update');
    Route::delete('/networks/{id}', [NetworkController::class, 'destroy'])->name('networks.destroy');

    Route::get('/cash', [CashController::class, 'index'])->name('cash.index');
    Route::post('/cash', [CashController::class, 'store'])->name('cash.store');

    Route::get('/transactions', [TransactionController::class, 'index'])->name('transactions.index');
    Route::post('/transactions', [TransactionController::class, 'store'])->name('transactions.store');
    Route::delete('/transactions/{id}', [TransactionController::class, 'destroy'])->name('transactions.destroy');
    Route::get('/accounts/search', [TransactionController::class, 'search'])->name('accounts.search');

    // Expenses
    Route::get('/expenses', [ExpenseController::class, 'index'])->name('expenses.index');
    Route::post('/expenses', [ExpenseController::class, 'store'])->name('expenses.store');

    // Users
    Route::get('/users', [UserController::class, 'index'])->name('users.index');
    Route::post('/users', [UserController::class, 'store'])->name('users.store');
    Route::put('/users/{id}', [UserController::class, 'update'])->name('users.update');
    Route::post('/users/assign-role', [UserController::class, 'assignRole'])->name('users.assign-role');
    Route::post('/users/reset-password', [UserController::class, 'reset_password'])->name('users.reset-password');
});

