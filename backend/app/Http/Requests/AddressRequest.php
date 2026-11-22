<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class AddressRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'label'        => ['required', 'string', 'max:100'],
            'city'         => ['required', 'string', 'max:100'],
            'neighborhood' => ['required', 'string', 'max:150'],
            'landmark'     => ['nullable', 'string', 'max:255'],
            'phone'        => ['required', 'string', 'max:20'],
            'is_default'   => ['boolean'],
        ];
    }

    public function messages(): array
    {
        return [
            'label.required'        => 'Le libellé est obligatoire.',
            'city.required'         => 'La ville est obligatoire.',
            'neighborhood.required' => 'Le quartier est obligatoire.',
            'phone.required'        => 'Le numéro de téléphone est obligatoire.',
        ];
    }
}
