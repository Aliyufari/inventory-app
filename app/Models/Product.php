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
        'barcode',
        'cost',
        'retail_price',
        'wholesale_price',
        'store_id',
        'creator_id',
        'updator_id',
        'unit',
        'units_per_packet',
        'packets_per_carton',
        'status',
        'allow_wholesale',
        'min_stock_level',
        'image',
        'description',
    ];

    /* ============================
    | Relationships
    |============================ */
    public function categories(): BelongsToMany
    {
        return $this->belongsToMany(Category::class);
    }

    public function store()
    {
        return $this->belongsTo(Store::class);
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'creator_id');
    }

    public function updator()
    {
        return $this->belongsTo(User::class, 'updator_id');
    }

    public function stockMovements()
    {
        return $this->hasMany(StockMovement::class);
    }

    public function saleItems()
    {
        return $this->hasMany(SaleItem::class);
    }

    protected $casts = [
        'cost' => 'decimal:2',
        'retail_price' => 'decimal:2',
        'wholesale_price' => 'decimal:2',
        'allow_wholesale' => 'boolean',
        'status' => 'boolean',
        'units_per_packet' => 'integer',
        'packets_per_carton' => 'integer',
        'min_stock_level' => 'integer',
    ];

    public function getImageUrlAttribute()
    {
        return $this->image
            ? asset('storage/' . $this->image)
            : null;
    }

    /* ============================
     | Accessors
     |============================ */
    public function getStockAttribute(): int
    {
        return (int) $this->stockMovements()->sum('quantity');
    }

    /* ============================
     | Scopes
     |============================ */
    public function scopeLowStock($query, int $threshold = 5)
    {
        return $query->withSum('stockMovements as stock', 'quantity')
            ->having('stock', '<=', $threshold);
    }

    public function isLowStock(): bool
    {
        return $this->stock <= $this->min_stock_level;
    }

    public function isOutOfStock(): bool
    {
        return $this->stock <= 0;
    }

    public function getPriceFor(int $quantity): float
    {
        if ($this->allow_wholesale && $quantity >= $this->units_per_packet) {
            return (float) $this->wholesale_price;
        }

        return (float) $this->retail_price;
    }

    protected static function booted()
    {
        static::deleting(function ($product) {
            if ($product->saleItems()->exists()) {
                throw new \Exception('Product cannot be deleted once sold.');
            }
        });
    }
}
