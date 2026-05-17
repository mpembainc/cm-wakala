<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ShopTransactionResource extends JsonResource
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
            'receiptNo' => $this->receipt_no,
            'sellerName' => $this->seller_name,
            'sales' => $this->sales,
            'costs' => $this->costs,
            'balance' => $this->balance,
            'remark' => $this->remark,
            'createdAt' => $this->created_at,
            'transactionDate' => $this->transaction_date,
            'createdBy' => $this->user->name,
        ];
    }
}
