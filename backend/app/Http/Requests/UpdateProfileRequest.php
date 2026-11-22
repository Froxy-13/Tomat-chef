<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateProfileRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $userId = $this->user()->id;

        return [
            'first_name' => ['required', 'string', 'max:100'],
            'last_name'  => ['required', 'string', 'max:100'],
            'phone'      => ['required', 'string', 'max:20', Rule::unique('users', 'phone')->ignore($userId)],
            'email'      => ['required', 'email', Rule::unique('users', 'email')->ignore($userId)],
        ];
    }

    public function messages(): array
    {
        return [
            'first_name.required' => 'Le prénom est obligatoire.',
            'last_name.required'  => 'Le nom est obligatoire.',
            'phone.required'      => 'Le numéro de téléphone est obligatoire.',
            'phone.unique'        => 'Ce numéro de téléphone est déjà utilisé.',
            'email.required'      => 'L\'adresse e-mail est obligatoire.',
            'email.email'         => 'L\'adresse e-mail n\'est pas valide.',
            'email.unique'        => 'Cette adresse e-mail est déjà utilisée.',
        ];
    }
}
