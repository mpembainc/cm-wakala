<?php

namespace App\Traits;

trait NormalizesPhone
{
    /**
     * Normalize a phone number for a given input key.
     *
     * @param string $key
     */
    protected function normalizePhone(string $key = 'phone_number'): void
    {
        if ($this->has($key)) {
            $phone = preg_replace('/[\s\-()]/', '', $this->input($key));

            if (str_starts_with($phone, '255')) {
                $phone = '0' . substr($phone, 3);
            }

            if (str_starts_with($phone, '+255')) {
                $phone = '0' . substr($phone, 4);
            }

            $this->merge([$key => $phone]);
        }
    }

    /**
     * Reusable phone validation rules for any column.
     *
     * @param string $table Optional: table name for unique rule
     * @param string $column Optional: column name for unique rule
     * @return array
     */
    protected function phoneRules(string $table = 'pempers_customers', string $column = 'phone_number'): array
    {
        return [
            'required',
            'regex:/^0(?:6|7|2)\d{8}$/',
            "unique:$table,$column",
        ];
    }

    /**
     * Reusable phone validation message.
     */
    protected function phoneValidationMessage(string $key = 'phone_number'): array
    {
        return [
            "$key.regex" => 'The phone number must be a valid Tanzanian mobile or landline number, in 0 format.',
            "$key.required" => 'The phone number field is required.',
            "$key.unique" => 'The phone number has already been taken.',
        ];
    }
}
