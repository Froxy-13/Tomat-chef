<?php

namespace Database\Seeders;

use App\Models\Product;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class ProductSeeder extends Seeder
{
    public function run(): void
    {
        $products = [
            [
                'name'        => 'Tomate Concentrée 70g',
                'slug'        => 'tomate-concentree-70g',
                'description' => 'Boîte de tomate concentrée Tomat\'chef 70g. Idéale pour les sauces du quotidien.',
                'price'       => 300,
                'stock'       => 500,
                'weight'      => '70g',
                'is_active'   => true,
            ],
            [
                'name'        => 'Tomate Concentrée 400g',
                'slug'        => 'tomate-concentree-400g',
                'description' => 'Boîte de tomate concentrée Tomat\'chef 400g. Format familial.',
                'price'       => 1200,
                'stock'       => 300,
                'weight'      => '400g',
                'is_active'   => true,
            ],
            [
                'name'        => 'Tomate Concentrée Seau 2.2kg',
                'slug'        => 'tomate-concentree-seau-2-2kg',
                'description' => 'Seau de tomate concentrée Tomat\'chef 2.2kg. Format professionnel pour restaurants et revendeurs.',
                'price'       => 5500,
                'stock'       => 150,
                'weight'      => '2.2kg',
                'is_active'   => true,
            ],
        ];

        foreach ($products as $data) {
            Product::create($data);
        }
    }
}
