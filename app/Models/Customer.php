<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Customer extends Model
{
    /** @use HasFactory<\Database\Factories\CustomerFactory> */
    use HasFactory, HasUuids;

    protected $fillable = [
        'name',
        'email',
        'type', // retail/wholesale
        'phone', // Consider adding for pharmacy contacts
        'address', // Consider adding for delivery/wholesale
    ];

    // If you want to enforce customer types
    protected $casts = [
        'type' => 'string',
    ];

    public function transactions(): HasMany
    {
        return $this->hasMany(Inventory::class);
    }

    // Helper methods
    public function isRetail(): bool
    {
        return $this->type === 'retail';
    }

    public function isWholesale(): bool
    {
        return $this->type === 'wholesale';
    }

    // Scope for filtering
    public function scopeRetail($query)
    {
        return $query->where('type', 'retail');
    }

    public function scopeWholesale($query)
    {
        return $query->where('type', 'wholesale');
    }
}
