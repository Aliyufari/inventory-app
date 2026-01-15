<?php

use App\Models\User;
use App\Models\Store;
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
        Schema::create('sales', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('invoice_number')->unique();
            $table->enum('payment_method', PaymentMethod::values());
            $table->enum('customer_type', ['retail', 'wholesale']);
            $table->foreignIdFor(User::class, 'user_id')->constrained()->cascadeOnDelete();
            $table->foreignIdFor(Customer::class, 'customer_id')->nullable()->constrained()->cascadeOnDelete();
            $table->foreignIdFor(Store::class, 'store_id')->constrained()->cascadeOnDelete();
            $table->decimal('discount', 12, 2)->default(0);
            $table->decimal('tax', 12, 2)->default(0);
            $table->decimal('total', 12, 2)->default(0);
            $table->enum('status', ['pending', 'completed', 'cancelled'])->default('completed');
            $table->string('note')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('sales');
    }
};
