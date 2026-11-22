<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreProductRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name'        => ['required', 'string', 'max:200'],
            'description' => ['nullable', 'string'],
            'price'       => ['required', 'integer', 'min:1'],
            'stock'       => ['required', 'integer', 'min:0'],
            'weight'      => ['nullable', 'string', 'max:50'],
            'is_active'   => ['boolean'],
        ];
    }

    public function messages(): array
    {
        return [
            'name.required'  => 'Le nom du produit est obligatoire.',
            'price.required' => 'Le prix est obligatoire.',
            'price.integer'  => 'Le prix doit être un entier (en FCFA).',
            'price.min'      => 'Le prix doit être supérieur à 0.',
            'stock.required' => 'Le stock est obligatoire.',
            'stock.integer'  => 'Le stock doit être un entier.',
            'stock.min'      => 'Le stock ne peut pas être négatif.',
        ];
    }
}
