<?php

namespace App\Http\Requests;

use App\Traits\NormalizesPhone;
use Illuminate\Foundation\Http\FormRequest;

class PostCustomerRequest extends FormRequest
{
    use NormalizesPhone;

    protected function prepareForValidation(): void
    {
        $this->normalizePhone();
    }

    public function rules(): array
    {
        return [
            'name' => ['required'],
            'phone_number' => $this->phoneRules(),
            'email' => ['nullable', 'email', 'max:50', 'unique:pempers_customers,email'],
            'tin_number' => ['nullable'],
            'address' => ['nullable'],
        ];
    }

    public function messages(): array
    {
        return $this->phoneValidationMessage();
    }
}
