<?php

namespace Database\Seeders;

use App\Models\Store;
use App\Models\Product;
use App\Models\Category;
use Illuminate\Database\Seeder;

class ProductSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Ensure the store exists
        $store = Store::firstOrCreate(['name' => 'Main Store']);

        // Ensure categories exist
        $antiBioCategory = Category::firstOrCreate(['name' => 'Antibiotics']);
        $painReliefCategory = Category::firstOrCreate(['name' => 'Pain Relief']);

        // Create Paracetamol
        $paracetamol = Product::firstOrCreate([
            'name' => 'Paracetamol',
            'brand' => 'M & B',
            'price' => 200,
            'quantity' => 100,
            'store_id' => $store->id,
            'description' => '',
        ]);

        $paracetamol->categories()->sync([$antiBioCategory->id, $painReliefCategory->id]);

        // Create Arthimeter
        $arthimeter = Product::firstOrCreate([
            'name' => 'Arthimeter',
            'brand' => 'India',
            'price' => 300,
            'quantity' => 100,
            'store_id' => $store->id,
            'description' => '',
        ]);

        $arthimeter->categories()->sync([$antiBioCategory->id]);
    }
}
