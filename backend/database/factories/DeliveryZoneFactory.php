<?php

namespace Database\Factories;

use App\Models\DeliveryZone;
use Illuminate\Database\Eloquent\Factories\Factory;

class DeliveryZoneFactory extends Factory
{
    protected $model = DeliveryZone::class;

    public function definition(): array
    {
        return [
            'name'      => fake()->unique()->randomElement(['Dakar Centre', 'Banlieue', 'Régions', 'Thiès', 'Ziguinchor']),
            'fee'       => fake()->randomElement([1000, 1500, 2000, 3000]),
            'is_active' => true,
        ];
    }

    public function inactive(): static
    {
        return $this->state(['is_active' => false]);
    }
}
