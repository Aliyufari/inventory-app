<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Payment extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'inventory_id',
        'method',
        'amount',
    ];

    // Payment belongs to an inventory transaction
    public function inventory(): BelongsTo
    {
        return $this->belongsTo(Inventory::class);
    }
}
