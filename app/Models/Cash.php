<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Cash extends Model
{
    use HasFactory;

    public function transaction(): BelongsTo
    {
        return $this->belongsTo(Transaction::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public static function getBalance(): float
    {
        return Cash::sum('amount');
    }

    public static function addTransaction(float $amount, string $remark, ?string $reference = null): Cash
    {
        $cash = new Cash();
        $cash->amount = $amount;
        $cash->remark = $remark;
        $cash->reference = $reference;
        $cash->user_id = auth()->id();
        $cash->save();

        return $cash;
    }

    /**
     * Record a loan repayment cash inflow.
     * Ensures the amount is stored as a positive value.
     */
    public static function addRepayment(float $amount, string $remark, ?string $reference = null): Cash
    {
        return self::addTransaction(abs($amount), $remark, $reference);
    }
}
