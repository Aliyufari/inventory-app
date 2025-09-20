<?php

namespace App\Http\Requests;

use Illuminate\Validation\Rules\Password;
use App\Models\User;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreUserRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'email' => [
                'required',
                'string',
                'lowercase',
                'email',
                'max:255',
                Rule::unique('users', 'email')
            ],
            'gender' => ['required', 'string', 'max:255'],
            'role_id' => ['required', 'string', 'max:255', 'exists:roles,id'],
            'password' => ['required', Password::defaults()],
        ];
    }
}
