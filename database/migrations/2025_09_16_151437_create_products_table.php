<?php

use App\Models\Category;
use App\Models\Store;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('products', function (Blueprint $table) {
            $table->uuid('id')->primary();
            // Basic product info
            $table->string('name');
            $table->string('brand')->nullable();
            $table->decimal('buying_price', 10, 2);
            $table->decimal('retail_price', 10, 2); // price per base unit
            $table->decimal('wholesale_price', 10, 2); // price per base unit
            $table->integer('quantity')->default(0); // always store in base units

            // Unit & conversion handling
            $table->string('unit')->default('pcs'); // base unit, e.g., tablet, bottle
            $table->integer('units_per_packet')->nullable(); // e.g., 10 tablets per strip
            $table->integer('packets_per_carton')->nullable(); // e.g., 10 strips per carton

            // Relationships
            $table->foreignIdFor(Store::class, 'store_id')->constrained()->cascadeOnDelete();

            // Extra info
            $table->text('description')->nullable();

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('products');
    }
};
