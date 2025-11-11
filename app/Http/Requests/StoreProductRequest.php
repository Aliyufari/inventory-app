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
            'name' => ['required', 'string', 'max:255', Rule::unique('products', 'name')],
            'brand' => ['nullable', 'string', 'max:255'],
            'buying_price' => ['required', 'numeric', 'min:0'],
            'retail_price' => ['required', 'numeric', 'min:0'],
            'wholesale_price' => ['required', 'numeric', 'min:0'],
            'quantity' => ['required', 'integer', 'min:0'],

            // Relationships
            'store_id' => ['required', 'uuid', 'exists:stores,id'],
            'category_ids' => ['required', 'array', 'min:1'],
            'category_ids.*' => ['uuid', 'exists:categories,id'],

            // Unit conversion fields
            'units_per_packet' => ['nullable', 'integer', 'min:1'],
            'packets_per_carton' => ['nullable', 'integer', 'min:1'],

            'description' => ['nullable', 'string', 'max:1000'],
        ];
    }

    public function messages(): array
    {
        return [
            'name.unique' => 'This product name already exists.',
            'category_ids.required' => 'Please select at least one category.',
            'store_id.exists' => 'Selected store not found.',
        ];
    }
}
