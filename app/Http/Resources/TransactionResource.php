<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TransactionResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'network' => $this->network->name,
            'accountNumber' => $this->account_number,
            'accountName' => $this->account_name,
            'amount' => $this->amount,
            'customer' => $this->customer,
            'commission' => $this->commission,
            'fee' => $this->fee,
            'createdAt' => $this->created_at,
            'createdBy' => strtoupper($this->user->name),
        ];
    }
}
