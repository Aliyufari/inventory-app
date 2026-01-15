<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProductResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'brand' => $this->brand,
            'barcode' => $this->barcode,
            'cost' => $this->cost,
            'retail_price' => $this->retail_price,
            'wholesale_price' => $this->wholesale_price,
            'unit' => $this->unit,
            'units_per_packet' => $this->units_per_packet,
            'packets_per_carton' => $this->packets_per_carton,
            'min_stock_level' => $this->min_stock_level,
            'status' => $this->status,
            'allow_wholesale' => $this->allow_wholesale,
            'description' => $this->description,
            'image' => $this->image_url,

            // Relationships
            'categories' => $this->categories->map(fn($c) => [
                'id' => $c->id,
                'name' => $c->name,
            ]),

            'store' => $this->store
                ? [
                    'id' => $this->store->id,
                    'name' => $this->store->name,
                ]
                : null,

            'created_by' => $this->creator
                ? [
                    'id' => $this->creator->id,
                    'name' => $this->creator->name,
                ]
                : null,

            'updated_by' => $this->updator
                ? [
                    'id' => $this->updator->id,
                    'name' => $this->updator->name,
                ]
                : null,

            'created_at' => $this->created_at?->format('d/m/Y h:i A'),
            'updated_at' => $this->updated_at?->format('d/m/Y h:i A'),
        ];
    }
}
