<?php

namespace App\Http\Resources;

use App\Models\Customer;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin Customer */
class CustomerResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'phoneNumber' => $this->phone_number,
            'email' => $this->email,
            'tinNumber' => $this->tin_number,
            'address' => $this->address,
            'active' => $this->active,
            'createdAt' => $this->created_at,
            'createdBy' => $this->createdBy,
        ];
    }
}
