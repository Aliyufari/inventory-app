<?php

namespace App\Http\Requests;

use Illuminate\Validation\Rule;
use Illuminate\Foundation\Http\FormRequest;

class UpdateProductRequest extends FormRequest
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
            'name' => [
                'required',
                'string',
                'max:255',
                Rule::unique('products', 'name')->ignore($this->route('product')),
            ],

            'buying_price' => ['required', 'numeric', 'min:0'],
            'retail_price' => ['required', 'numeric', 'min:0'],
            'wholesale_price' => ['required', 'numeric', 'min:0'],
            'quantity' => ['nullable', 'numeric', 'min:0'],
            'store_id' => ['required', 'uuid', 'exists:stores,id'],
            'category_ids' => ['nullable', 'array'],
            'category_ids.*' => ['exists:categories,id'],
            'brand' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:255'],
            'units_per_packet' => ['nullable', 'integer', 'min:1'],
            'packets_per_carton' => ['nullable', 'integer', 'min:1'],
        ];
    }

    /**
     * Custom validation messages.
     */
    public function messages(): array
    {
        return [
            'name.unique' => 'This product name already exists.',
            'category_ids.required' => 'Please select at least one category.',
            'store_id.exists' => 'Selected store not found.',
            'units_per_packet.min' => 'Units per packet must be at least 1.',
            'packets_per_carton.min' => 'Packets per carton must be at least 1.',
        ];
    }
}
