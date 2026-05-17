<?php

namespace App\Http\Requests;

use App\Models\Customer;
use App\Traits\NormalizesPhone;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateCustomerRequest extends FormRequest
{
    use NormalizesPhone;

    protected function prepareForValidation(): void
    {
        $this->normalizePhone();
    }

    public function rules(): array
    {
        /** @var Customer|null $customer */
        $customer = $this->route('customer');

        return [
            'name' => ['required'],
            'phone_number' => [
                'required',
                'regex:/^0(?:6|7|2)\d{8}$/',
                Rule::unique('pempers_customers', 'phone_number')->ignore($customer?->id),
            ],
            'email' => [
                'nullable',
                'email',
                'max:50',
                Rule::unique('pempers_customers', 'email')->ignore($customer?->id),
            ],
            'tin_number' => ['nullable'],
            'address' => ['nullable'],
        ];
    }

    public function messages(): array
    {
        return $this->phoneValidationMessage();
    }
}
