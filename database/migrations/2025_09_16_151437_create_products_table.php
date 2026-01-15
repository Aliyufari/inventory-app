<?php

use App\Models\Category;
use App\Models\Store;
use App\Models\User;
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
            $table->string('name');
            $table->string('brand')->nullable();
            $table->string('barcode')->nullable()->unique()->index();

            $table->decimal('cost', 10, 2);
            $table->decimal('retail_price', 10, 2);
            $table->decimal('wholesale_price', 10, 2);

            $table->string('unit')->default('pcs');
            $table->integer('units_per_packet')->nullable();
            $table->integer('packets_per_carton')->nullable();

            $table->foreignIdFor(Store::class, 'store_id')->constrained()->cascadeOnDelete();
            $table->foreignIdFor(User::class, 'creator_id')->constrained()->cascadeOnDelete();
            $table->foreignIdFor(User::class, 'updator_id')->nullable()->constrained()->cascadeOnDelete();

            $table->boolean('status')->default(true);
            $table->boolean('allow_wholesale')->default(true);
            $table->string('min_stock_level')->default(10);

            $table->string('image')->nullable();
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
