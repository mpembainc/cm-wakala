<?php

namespace App\Models;

use App\Traits\BelongsToUser;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Customer extends Model
{
    use BelongsToUser;

    protected $table = 'pempers_customers';

    protected $fillable = ['name', 'phone_number', 'email', 'tin_number', 'address', 'created_by', 'active'];

    public function pampersCreditRepayments(): HasMany
    {
        return $this->hasMany(PampersCreditRepayment::class);
    }
}
