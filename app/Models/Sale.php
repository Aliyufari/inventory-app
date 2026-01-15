<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Sale extends Model
{
    /** @use HasFactory<\Database\Factories\SaleFactory> */
    use HasFactory, HasUlids;

    protected $fillable = [
        'invoice_number',
        'payment_method',
        'customer_type',
        'user_id',
        'customer_id',
        'store_id',
        'discount',
        'tax',
        'total',
        'status',
        'note',
    ];

    /* ============================
    | Relationships
    |============================ */
    public function items()
    {
        return $this->hasMany(SaleItem::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function customer()
    {
        return $this->belongsTo(Customer::class);
    }

    public function store()
    {
        return $this->belongsTo(Store::class);
    }

    /* ============================
    | Helpers
    |============================ */
    public function getSubtotalAttribute()
    {
        return $this->items()->sum('subtotal');
    }
}
