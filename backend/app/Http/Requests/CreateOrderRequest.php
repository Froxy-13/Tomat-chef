<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class CreateOrderRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $userId = $this->user()->id;

        return [
            'address_id'       => ['required', 'integer', "exists:addresses,id,user_id,{$userId}"],
            'delivery_zone_id' => ['required', 'integer', 'exists:delivery_zones,id,is_active,1'],
        ];
    }

    public function messages(): array
    {
        return [
            'address_id.required'       => 'L\'adresse de livraison est obligatoire.',
            'address_id.exists'         => 'Adresse introuvable.',
            'delivery_zone_id.required' => 'La zone de livraison est obligatoire.',
            'delivery_zone_id.exists'   => 'Zone de livraison invalide ou inactive.',
        ];
    }
}
