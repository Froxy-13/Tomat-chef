<?php

namespace Tests\Feature;

use App\Models\Product;
use Tests\TestCase;

class ProductTest extends TestCase
{
    // -------------------------------------------------------------------------
    // Catalogue public
    // -------------------------------------------------------------------------

    public function test_anyone_can_list_active_products(): void
    {
        Product::factory()->count(3)->create(['is_active' => true]);
        Product::factory()->create(['is_active' => false]);

        $this->getJson('/api/v1/products')
             ->assertOk()
             ->assertJsonPath('meta.total', 3);
    }

    public function test_product_list_is_paginated_by_12(): void
    {
        Product::factory()->count(15)->create(['is_active' => true]);

        $this->getJson('/api/v1/products')
             ->assertOk()
             ->assertJsonPath('meta.per_page', 12)
             ->assertJsonCount(12, 'data');
    }

    public function test_product_list_can_be_searched(): void
    {
        Product::factory()->create(['name' => 'Tomate Spéciale 70g', 'slug' => 'tomate-speciale-70g', 'is_active' => true]);
        Product::factory()->create(['name' => 'Tomate Autre', 'slug' => 'tomate-autre', 'is_active' => true]);

        $this->getJson('/api/v1/products?search=Spéciale')
             ->assertOk()
             ->assertJsonPath('meta.total', 1)
             ->assertJsonPath('data.0.name', 'Tomate Spéciale 70g');
    }

    public function test_product_list_can_be_sorted_by_price(): void
    {
        Product::factory()->create(['slug' => 'p-cheap', 'price' => 500, 'is_active' => true]);
        Product::factory()->create(['slug' => 'p-expensive', 'price' => 5000, 'is_active' => true]);

        $asc = $this->getJson('/api/v1/products?sort=price_asc')->assertOk();
        $this->assertEquals(500, $asc->json('data.0.price'));

        $desc = $this->getJson('/api/v1/products?sort=price_desc')->assertOk();
        $this->assertEquals(5000, $desc->json('data.0.price'));
    }

    public function test_anyone_can_get_product_by_slug(): void
    {
        $product = Product::factory()->create(['is_active' => true]);

        $this->getJson("/api/v1/products/{$product->slug}")
             ->assertOk()
             ->assertJsonPath('data.id', $product->id);
    }

    public function test_inactive_product_returns_404(): void
    {
        $product = Product::factory()->create(['is_active' => false]);

        $this->getJson("/api/v1/products/{$product->slug}")->assertStatus(404);
    }

    // -------------------------------------------------------------------------
    // CRUD Admin
    // -------------------------------------------------------------------------

    public function test_admin_can_create_product(): void
    {
        $this->actingAsAdmin();

        $this->postJson('/api/v1/admin/products', [
            'name'      => 'Tomate Test 400g',
            'price'     => 1200,
            'stock'     => 50,
            'is_active' => true,
        ])->assertStatus(201)
          ->assertJsonPath('data.name', 'Tomate Test 400g')
          ->assertJsonPath('data.slug', 'tomate-test-400g');
    }

    public function test_admin_product_slug_is_unique(): void
    {
        $this->actingAsAdmin();
        Product::factory()->create(['name' => 'Doublon', 'slug' => 'doublon']);

        $response = $this->postJson('/api/v1/admin/products', [
            'name'      => 'Doublon',
            'price'     => 1000,
            'stock'     => 10,
            'is_active' => true,
        ])->assertStatus(201);

        $this->assertStringStartsWith('doublon-', $response->json('data.slug'));
    }

    public function test_admin_can_update_product(): void
    {
        $this->actingAsAdmin();
        $product = Product::factory()->create();

        $this->putJson("/api/v1/admin/products/{$product->id}", [
            'name'      => 'Nom Modifié',
            'price'     => 9999,
            'stock'     => $product->stock,
            'is_active' => true,
        ])->assertOk()->assertJsonPath('data.price', 9999);
    }

    public function test_admin_can_soft_delete_product(): void
    {
        $this->actingAsAdmin();
        $product = Product::factory()->create();

        $this->deleteJson("/api/v1/admin/products/{$product->id}")->assertOk();

        $this->assertSoftDeleted('products', ['id' => $product->id]);
    }

    public function test_client_cannot_create_product(): void
    {
        $this->actingAsClient();

        $this->postJson('/api/v1/admin/products', [
            'name'  => 'Produit Interdit',
            'price' => 1000,
            'stock' => 10,
        ])->assertStatus(403);
    }

    public function test_admin_product_requires_valid_price(): void
    {
        $this->actingAsAdmin();

        $this->postJson('/api/v1/admin/products', [
            'name'      => 'Produit Prix Nul',
            'price'     => 0,
            'stock'     => 10,
            'is_active' => true,
        ])->assertStatus(422)->assertJsonStructure(['errors' => ['price']]);
    }
}
