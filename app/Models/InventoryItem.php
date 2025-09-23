<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class InventoryItem extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'inventory_id',
        'product_id',
        'quantity',
        'unit_price',
        'total_price',
    ];

    // Each item belongs to an inventory transaction
    public function inventory(): BelongsTo
    {
        return $this->belongsTo(Inventory::class);
    }

    // Each item belongs to a product
    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }
}
