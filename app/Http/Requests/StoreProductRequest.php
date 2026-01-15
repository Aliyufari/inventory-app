<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

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
            'name' => [
                'required',
                'string',
                'max:255',
                Rule::unique('products', 'name'),
            ],

            'brand' => ['nullable', 'string', 'max:255'],

            'barcode' => [
                'nullable',
                'string',
                'max:255',
                Rule::unique('products', 'barcode'),
            ],

            'cost' => ['required', 'numeric', 'min:0'],

            'retail_price' => ['required', 'numeric', 'min:0'],

            'wholesale_price' => ['nullable', 'numeric', 'min:0'],

            'allow_wholesale' => ['required', 'boolean'],

            'unit' => ['nullable', 'string', 'max:50'],

            'units_per_packet' => ['nullable', 'integer', 'min:1'],

            'packets_per_carton' => ['nullable', 'integer', 'min:1'],

            'min_stock_level' => ['nullable', 'integer', 'min:0'],

            'status' => ['required', 'boolean'],

            'category_ids' => ['required', 'array', 'min:1'],
            'category_ids.*' => ['uuid', 'exists:categories,id'],

            'store_id' => ['required', 'string', 'exists:stores,id'],

            'image' => ['nullable', 'image', 'mimes:jpg,jpeg,png', 'max:2048'],

            'description' => ['nullable', 'string', 'max:1000'],
        ];
    }

    /**
     * Custom error messages.
     */
    public function messages(): array
    {
        return [
            'name.unique' => 'This product name already exists.',
            'barcode.unique' => 'This barcode is already assigned to another product.',
            'category_ids.required' => 'Please select at least one category.',
            'allow_wholesale.required' => 'Please specify if wholesale pricing is allowed.',
            'status.required' => 'Please specify the product status.',
        ];
    }

    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation(): void
    {
        $this->merge([
            'allow_wholesale' => filter_var($this->allow_wholesale, FILTER_VALIDATE_BOOLEAN),
            'status' => filter_var($this->status, FILTER_VALIDATE_BOOLEAN),
        ]);
    }
}
