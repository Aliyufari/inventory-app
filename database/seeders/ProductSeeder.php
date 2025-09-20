<?php

namespace Database\Seeders;

use App\Models\Store;
use App\Models\Product;
use App\Models\Category;
use Illuminate\Database\Seeder;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;

class ProductSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $store = Store::where('name', 'Main Store')->first();
        $antiBioCategory = Category::where('name', 'Antibiotics')->first();

        Product::firstOrCreate([
            'name' => 'Paracetamol',
            'brand' => 'M & B',
            'price' => 200,
            'quantity' => 100,
            'store_id' => $store->id,
            'category_id' => $antiBioCategory->id,
            'description' => '',
        ]);

        Product::firstOrCreate([
            'name' => 'Arthimeter',
            'brand' => 'India',
            'price' => 300,
            'quantity' => 100,
            'store_id' => $store->id,
            'category_id' => $antiBioCategory->id,
            'description' => '',
        ]);
    }
}
