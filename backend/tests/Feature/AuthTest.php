<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class AuthTest extends TestCase
{
    // -------------------------------------------------------------------------
    // Inscription client
    // -------------------------------------------------------------------------

    public function test_client_can_register(): void
    {
        $response = $this->postJson('/api/v1/auth/register', [
            'first_name'            => 'Ibrahima',
            'last_name'             => 'Sow',
            'email'                 => 'ibrahima@test.sn',
            'phone'                 => '+221770000010',
            'password'              => 'Secret@123',
            'password_confirmation' => 'Secret@123',
        ]);

        $response->assertStatus(201)
                 ->assertJsonStructure(['token', 'user' => ['id', 'email', 'role']]);

        $this->assertDatabaseHas('users', ['email' => 'ibrahima@test.sn', 'role' => 'client']);
    }

    public function test_register_fails_with_duplicate_email(): void
    {
        $this->makeClient(['email' => 'dup@test.sn']);

        $this->postJson('/api/v1/auth/register', [
            'first_name'            => 'Test',
            'last_name'             => 'User',
            'email'                 => 'dup@test.sn',
            'phone'                 => '+221770000011',
            'password'              => 'Secret@123',
            'password_confirmation' => 'Secret@123',
        ])->assertStatus(422)->assertJsonPath('errors.email.0', fn ($v) => str_contains($v, 'déjà utilisée'));
    }

    public function test_register_fails_with_short_password(): void
    {
        $this->postJson('/api/v1/auth/register', [
            'first_name'            => 'Test',
            'last_name'             => 'User',
            'email'                 => 'short@test.sn',
            'phone'                 => '+221770000012',
            'password'              => '1234567',
            'password_confirmation' => '1234567',
        ])->assertStatus(422)->assertJsonPath('errors.password.0', fn ($v) => str_contains($v, '8'));
    }

    // -------------------------------------------------------------------------
    // Connexion client
    // -------------------------------------------------------------------------

    public function test_client_can_login(): void
    {
        $user = $this->makeClient(['password' => Hash::make('MyPass@123')]);

        $this->postJson('/api/v1/auth/login', [
            'email'    => $user->email,
            'password' => 'MyPass@123',
        ])->assertOk()->assertJsonStructure(['token', 'user']);
    }

    public function test_login_fails_with_wrong_password(): void
    {
        $user = $this->makeClient();

        $this->postJson('/api/v1/auth/login', [
            'email'    => $user->email,
            'password' => 'wrongpassword',
        ])->assertStatus(401);
    }

    public function test_inactive_client_cannot_login(): void
    {
        $user = $this->makeClient(['is_active' => false, 'password' => Hash::make('MyPass@123')]);

        $this->postJson('/api/v1/auth/login', [
            'email'    => $user->email,
            'password' => 'MyPass@123',
        ])->assertStatus(403);
    }

    public function test_client_credentials_rejected_on_admin_login(): void
    {
        $client = $this->makeClient(['password' => Hash::make('MyPass@123')]);

        $this->postJson('/api/v1/admin/auth/login', [
            'email'    => $client->email,
            'password' => 'MyPass@123',
        ])->assertStatus(401);
    }

    // -------------------------------------------------------------------------
    // Connexion admin
    // -------------------------------------------------------------------------

    public function test_admin_can_login(): void
    {
        $admin = $this->makeAdmin(['password' => Hash::make('Admin@123')]);

        $this->postJson('/api/v1/admin/auth/login', [
            'email'    => $admin->email,
            'password' => 'Admin@123',
        ])->assertOk()->assertJsonStructure(['token', 'user']);
    }

    // -------------------------------------------------------------------------
    // /me et déconnexion
    // -------------------------------------------------------------------------

    public function test_me_returns_authenticated_user(): void
    {
        $user = $this->actingAsClient();

        $this->getJson('/api/v1/me')
             ->assertOk()
             ->assertJsonPath('email', $user->email)
             ->assertJsonPath('role', 'client');
    }

    public function test_me_requires_authentication(): void
    {
        $this->getJson('/api/v1/me')->assertStatus(401);
    }

    public function test_admin_me_requires_admin_role(): void
    {
        $this->actingAsClient();

        $this->getJson('/api/v1/admin/me')->assertStatus(403);
    }

    public function test_client_can_logout(): void
    {
        $this->app['auth']->forgetGuards();
        [$user, $headers] = $this->tokenFor($this->makeClient());

        $this->postJson('/api/v1/auth/logout', [], $headers)->assertOk();

        // Réinitialise le cache de la garde pour simuler une nouvelle requête
        $this->app['auth']->forgetGuards();

        // Le token est révoqué : /me doit retourner 401
        $this->getJson('/api/v1/me', $headers)->assertStatus(401);
    }

    // -------------------------------------------------------------------------
    // Isolation des rôles
    // -------------------------------------------------------------------------

    public function test_client_cannot_access_admin_routes(): void
    {
        $this->actingAsClient();

        $this->getJson('/api/v1/admin/products')->assertStatus(403);
    }

    public function test_unauthenticated_request_returns_401(): void
    {
        $this->getJson('/api/v1/admin/products')->assertStatus(401);
    }
}
