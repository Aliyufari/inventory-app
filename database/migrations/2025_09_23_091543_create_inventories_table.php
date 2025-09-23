<?php

use App\Models\User;
use App\Models\Store;
use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('inventories', function (Blueprint $table) {
            $table->uuid('id')->primary();

            $table->enum('type', ['purchase', 'sale', 'return', 'adjustment']);
            // sale = customer buying, purchase = stock-in, etc.

            $table->foreignIdFor(User::class, 'user_id')->constrained()->cascadeOnDelete();
            // who made the transaction (cashier, pharmacist)

            $table->foreignIdFor(Store::class, 'store_id')->constrained()->cascadeOnDelete();

            $table->decimal('subtotal', 12, 2)->default(0);
            $table->decimal('discount', 12, 2)->default(0);
            $table->decimal('total', 12, 2)->default(0);
            $table->enum('status', ['pending', 'completed', 'cancelled'])->default('completed');

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('inventories');
    }
};
