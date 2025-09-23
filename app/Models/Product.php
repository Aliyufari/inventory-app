<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Product extends Model
{
    /** @use HasFactory<\Database\Factories\ProductFactory> */
    use HasFactory, HasUuids;

    protected $fillable = [
        'name',
        'brand',
        'price',
        'quantity',
        'unit',
        'units_per_packet',
        'packets_per_carton',
        'store_id',
        'description',
    ];

    // A product belongs to a store
    public function store(): BelongsTo
    {
        return $this->belongsTo(Store::class);
    }

    // A product can belong to many categories
    public function categories(): BelongsToMany
    {
        return $this->belongsToMany(Category::class);
    }

    // A product appears in many inventory items
    public function inventoryItems(): HasMany
    {
        return $this->hasMany(InventoryItem::class);
    }
}
