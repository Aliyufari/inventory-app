<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class StockMovement extends Model
{
    use HasUuids;

    protected $fillable = [
        'product_id',
        'store_id',
        'user_id',
        'type',
        'quantity',
        'reason',
        'reference_id',
        'note',
    ];

    /* ============================
     | Relationships
     |============================ */
    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    public function store()
    {
        return $this->belongsTo(Store::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /* ============================
     | Helpers
     |============================ */
    public function isIn(): bool
    {
        return $this->type === 'in';
    }

    public function isOut(): bool
    {
        return $this->type === 'out';
    }
}
