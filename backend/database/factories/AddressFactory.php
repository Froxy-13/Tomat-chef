<?php

namespace Database\Factories;

use App\Models\Address;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class AddressFactory extends Factory
{
    protected $model = Address::class;

    public function definition(): array
    {
        return [
            'user_id'      => User::factory(),
            'label'        => fake()->randomElement(['Maison', 'Bureau', 'Boutique']),
            'city'         => fake()->randomElement(['Dakar', 'Thiès', 'Saint-Louis', 'Ziguinchor']),
            'neighborhood' => fake()->word(),
            'landmark'     => fake()->sentence(4),
            'phone'        => '+221' . fake()->numerify('7########'),
            'is_default'   => false,
        ];
    }
}
