<?php

use App\Models\User;
use App\Models\Store;
use App\Models\Product;
use App\Models\Customer;
use App\Enums\PaymentMethod;
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
        Schema::create('stock_movements', function (Blueprint $table) {
            $table->uuid('id')->primary();

            $table->foreignIdFor(Product::class)->constrained()->cascadeOnDelete();
            $table->foreignIdFor(Store::class)->constrained()->cascadeOnDelete();
            $table->foreignIdFor(User::class)->constrained()->cascadeOnDelete();

            $table->enum('type', ['in', 'out', 'adjustment']);
            $table->integer('quantity'); // +in, -out
            $table->enum('reason', ['purchase', 'sale', 'return', 'damage', 'expired', 'correction']);

            $table->uuid('reference_id')->nullable(); // sale_id, return_id
            $table->string('note')->nullable();

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('stock_movements');
    }
};
