<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CommissionResource extends JsonResource
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
            'amount' => $this->amount,
            'remark' => $this->remark,
            'createdAt' => $this->created_at,
            'createdBy' => strtoupper($this->user->name),
        ];
    }
}
