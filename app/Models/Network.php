<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

class Network extends Model
{
    use HasFactory;

    public function transactions(): hasMany
    {
        return $this->hasMany(Transaction::class);
    }

    public static function getBalance(): Collection
    {
        $result = DB::select("SELECT n.id, n.name, n.created_at AS createdAt, 
            COALESCE(SUM(t.amount), 0) AS balance
            FROM networks n LEFT JOIN transactions t ON t.network_id = n.id
            GROUP BY n.id, n.name, n.created_at
            ORDER BY n.name;
        ");

        return collect($result);
    }
}
