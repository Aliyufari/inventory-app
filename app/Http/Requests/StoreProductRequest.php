<?php

namespace App\Http\Requests;

use Illuminate\Validation\Rule;
use Illuminate\Foundation\Http\FormRequest;

class StoreProductRequest extends FormRequest
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
            'name' => ['required', 'string', 'max:255', Rule::unique('categories', 'name')],
            'price' => ['required', 'numeric'],
            'quantity' => ['required', 'numeric'],
            'store_id' => ['required', 'string', 'exists:stores,id'],
            'category_id' => ['required', 'string', 'exists:categories,id'],
            'brand' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:255']
        ];
    }
}
