<?php

namespace Tests;

use App\Models\DeliveryZone;
use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\TestCase as BaseTestCase;

abstract class TestCase extends BaseTestCase
{
    use RefreshDatabase;

    protected function makeAdmin(array $override = []): User
    {
        return User::factory()->create(array_merge([
            'role'      => 'admin',
            'is_active' => true,
        ], $override));
    }

    protected function makeClient(array $override = []): User
    {
        return User::factory()->create(array_merge([
            'role'      => 'client',
            'is_active' => true,
        ], $override));
    }

    protected function makeProduct(array $override = []): Product
    {
        return Product::factory()->create(array_merge([
            'price'     => 1000,
            'stock'     => 100,
            'is_active' => true,
        ], $override));
    }

    protected function makeZone(array $override = []): DeliveryZone
    {
        return DeliveryZone::factory()->create(array_merge([
            'fee'       => 1500,
            'is_active' => true,
        ], $override));
    }

    protected function actingAsClient(?User $user = null): User
    {
        $user ??= $this->makeClient();
        $this->actingAs($user, 'sanctum');
        return $user;
    }

    protected function actingAsAdmin(?User $user = null): User
    {
        $user ??= $this->makeAdmin();
        $this->actingAs($user, 'sanctum');
        return $user;
    }

    /** Crée un vrai token Sanctum et retourne [$user, $bearerHeader] */
    protected function tokenFor(User $user): array
    {
        $token = $user->createToken('test')->plainTextToken;
        return [$user, ['Authorization' => "Bearer {$token}"]];
    }
}
