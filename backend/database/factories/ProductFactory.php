<?php

namespace Database\Factories;

use App\Models\Product;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class ProductFactory extends Factory
{
    protected $model = Product::class;

    public function definition(): array
    {
        $name = 'Tomate Concentrée ' . fake()->unique()->numerify('###') . 'g';

        return [
            'name'        => $name,
            'slug'        => Str::slug($name),
            'description' => fake()->sentence(),
            'price'       => fake()->numberBetween(300, 6000),
            'stock'       => fake()->numberBetween(10, 500),
            'weight'      => fake()->randomElement(['70g', '400g', '800g', '2.2kg']),
            'is_active'   => true,
        ];
    }

    public function inactive(): static
    {
        return $this->state(['is_active' => false]);
    }

    public function outOfStock(): static
    {
        return $this->state(['stock' => 0]);
    }
}
