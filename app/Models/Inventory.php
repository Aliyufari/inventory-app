<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Inventory extends Model
{
    /** @use HasFactory<\Database\Factories\InventoryFactory> */
    use HasFactory, HasUuids;

    protected $fillable = [
        'customer_type',
        'tax',
        'payment_method',
        'type',
        'user_id',
        'customer_id',
        'store_id',
        'subtotal',
        'discount',
        'total',
        'status',
        'note',
    ];

    // An inventory transaction belongs to a user (cashier/pharmacist)
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function customer(): BelongsTo
    {
        return $this->belongsTo(
            Customer::class,
            'customer_id'
        );
    }

    // An inventory transaction is for a store
    public function store(): BelongsTo
    {
        return $this->belongsTo(Store::class);
    }

    // Each inventory transaction has many items (products with qty)
    public function items(): HasMany
    {
        return $this->hasMany(InventoryItem::class);
    }

    // Each inventory transaction may have multiple payments
    public function payments(): HasMany
    {
        return $this->hasMany(Payment::class);
    }

    public static function boot()
    {
        parent::boot();

        static::creating(function ($model) {
            $model->invoice_number = 'INVOICE' . '-' . str_pad(Inventory::count() + 1, 7, '0', STR_PAD_LEFT);
        });
    }
}
