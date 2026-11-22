<?php

namespace Tests\Feature;

use App\Models\Address;
use App\Models\Cart;
use App\Models\CartItem;
use App\Models\DeliveryZone;
use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use Tests\TestCase;

class OrderTest extends TestCase
{
    private function prepareClientWithCart(int $qty = 2): array
    {
        $client  = $this->makeClient();
        $product = $this->makeProduct(['price' => 1000, 'stock' => 50]);
        $zone    = $this->makeZone(['fee' => 1500]);
        $address = Address::factory()->create(['user_id' => $client->id, 'is_default' => true]);

        $cart = Cart::create(['user_id' => $client->id]);
        CartItem::create(['cart_id' => $cart->id, 'product_id' => $product->id, 'quantity' => $qty]);

        $this->actingAs($client, 'sanctum');

        return compact('client', 'product', 'zone', 'address', 'cart');
    }

    // -------------------------------------------------------------------------
    // Panier
    // -------------------------------------------------------------------------

    public function test_client_can_add_item_to_cart(): void
    {
        $client  = $this->actingAsClient();
        $product = $this->makeProduct(['stock' => 10]);

        $this->postJson('/api/v1/cart/items', ['product_id' => $product->id, 'quantity' => 3])
             ->assertOk()
             ->assertJsonPath('total', 3 * $product->price);
    }

    public function test_cart_rejects_quantity_exceeding_stock(): void
    {
        $client  = $this->actingAsClient();
        $product = $this->makeProduct(['stock' => 5]);

        $this->postJson('/api/v1/cart/items', ['product_id' => $product->id, 'quantity' => 10])
             ->assertStatus(422);
    }

    public function test_cart_total_is_calculated_server_side(): void
    {
        $client  = $this->actingAsClient();
        $product = $this->makeProduct(['price' => 1200, 'stock' => 20]);

        $cart = $this->postJson('/api/v1/cart/items', ['product_id' => $product->id, 'quantity' => 3])
                     ->assertOk()->json();

        $this->assertEquals(3600, $cart['total']);
    }

    public function test_client_can_clear_cart(): void
    {
        $data = $this->prepareClientWithCart();

        $this->deleteJson('/api/v1/cart')->assertOk();

        $this->assertDatabaseMissing('cart_items', ['cart_id' => $data['cart']->id]);
    }

    // -------------------------------------------------------------------------
    // Création de commande
    // -------------------------------------------------------------------------

    public function test_client_can_create_order_from_cart(): void
    {
        $data = $this->prepareClientWithCart(2);

        $response = $this->postJson('/api/v1/orders', [
            'address_id'       => $data['address']->id,
            'delivery_zone_id' => $data['zone']->id,
        ])->assertStatus(201);

        $number = $response->json('data.number');
        $this->assertMatchesRegularExpression('/^TC-\d{8}-\d{4}$/', $number);
        $this->assertDatabaseHas('orders', ['number' => $number, 'status' => 'pending_payment']);
    }

    public function test_order_total_includes_delivery_fee(): void
    {
        $data = $this->prepareClientWithCart(1); // 1 × 1000 FCFA

        $response = $this->postJson('/api/v1/orders', [
            'address_id'       => $data['address']->id,
            'delivery_zone_id' => $data['zone']->id,  // fee = 1500
        ])->assertStatus(201);

        $this->assertEquals(1000, $response->json('data.subtotal'));
        $this->assertEquals(1500, $response->json('data.delivery_fee'));
        $this->assertEquals(2500, $response->json('data.total'));
    }

    public function test_order_creation_snapshots_product_price(): void
    {
        $data = $this->prepareClientWithCart(1);
        $originalPrice = $data['product']->price;

        $response = $this->postJson('/api/v1/orders', [
            'address_id'       => $data['address']->id,
            'delivery_zone_id' => $data['zone']->id,
        ])->assertStatus(201);

        // On change le prix du produit après la commande
        $data['product']->update(['price' => 99999]);

        // Le sous-total de la ligne doit rester l'ancien prix
        $number = $response->json('data.number');
        $order  = Order::where('number', $number)->with('items')->first();
        $this->assertEquals($originalPrice, $order->items->first()->unit_price);
    }

    public function test_cart_is_emptied_after_order_creation(): void
    {
        $data = $this->prepareClientWithCart();

        $this->postJson('/api/v1/orders', [
            'address_id'       => $data['address']->id,
            'delivery_zone_id' => $data['zone']->id,
        ])->assertStatus(201);

        $this->assertDatabaseMissing('cart_items', ['cart_id' => $data['cart']->id]);
    }

    public function test_order_requires_non_empty_cart(): void
    {
        $client  = $this->actingAsClient();
        $zone    = $this->makeZone();
        $address = Address::factory()->create(['user_id' => $client->id]);

        $this->postJson('/api/v1/orders', [
            'address_id'       => $address->id,
            'delivery_zone_id' => $zone->id,
        ])->assertStatus(422);
    }

    public function test_order_rejects_inactive_delivery_zone(): void
    {
        $data    = $this->prepareClientWithCart();
        $badZone = DeliveryZone::factory()->create(['is_active' => false]);

        $this->postJson('/api/v1/orders', [
            'address_id'       => $data['address']->id,
            'delivery_zone_id' => $badZone->id,
        ])->assertStatus(422);
    }

    public function test_client_cannot_use_another_clients_address(): void
    {
        $data        = $this->prepareClientWithCart();
        $otherClient = $this->makeClient();
        $otherAddr   = Address::factory()->create(['user_id' => $otherClient->id]);

        $this->postJson('/api/v1/orders', [
            'address_id'       => $otherAddr->id,
            'delivery_zone_id' => $data['zone']->id,
        ])->assertStatus(422);
    }

    // -------------------------------------------------------------------------
    // Liste et détail commandes
    // -------------------------------------------------------------------------

    public function test_client_sees_only_own_orders(): void
    {
        $data1 = $this->prepareClientWithCart();
        $this->postJson('/api/v1/orders', [
            'address_id'       => $data1['address']->id,
            'delivery_zone_id' => $data1['zone']->id,
        ]);

        // Un deuxième client crée sa commande
        $data2 = $this->prepareClientWithCart();
        $this->postJson('/api/v1/orders', [
            'address_id'       => $data2['address']->id,
            'delivery_zone_id' => $data2['zone']->id,
        ]);

        // Client 1 ne voit que sa commande
        $this->actingAs($data1['client'], 'sanctum');
        $this->getJson('/api/v1/orders')
             ->assertOk()
             ->assertJsonPath('meta.total', 1);
    }

    // -------------------------------------------------------------------------
    // Admin commandes
    // -------------------------------------------------------------------------

    public function test_admin_can_see_all_orders(): void
    {
        $data = $this->prepareClientWithCart();
        $this->postJson('/api/v1/orders', [
            'address_id'       => $data['address']->id,
            'delivery_zone_id' => $data['zone']->id,
        ]);

        $this->actingAsAdmin();
        $this->getJson('/api/v1/admin/orders')
             ->assertOk()
             ->assertJsonPath('meta.total', 1);
    }

    public function test_admin_can_filter_orders_by_status(): void
    {
        $data = $this->prepareClientWithCart();
        $this->postJson('/api/v1/orders', [
            'address_id'       => $data['address']->id,
            'delivery_zone_id' => $data['zone']->id,
        ]);

        $this->actingAsAdmin();

        $this->getJson('/api/v1/admin/orders?status=pending_payment')
             ->assertOk()->assertJsonPath('meta.total', 1);

        $this->getJson('/api/v1/admin/orders?status=delivered')
             ->assertOk()->assertJsonPath('meta.total', 0);
    }

    public function test_admin_can_advance_order_status(): void
    {
        $data = $this->prepareClientWithCart();
        $resp = $this->postJson('/api/v1/orders', [
            'address_id'       => $data['address']->id,
            'delivery_zone_id' => $data['zone']->id,
        ]);
        $number = $resp->json('data.number');

        // Simuler un paiement accepté directement en base
        $order = Order::where('number', $number)->first();
        $order->update(['status' => 'received']);

        $this->actingAsAdmin();

        $this->putJson("/api/v1/admin/orders/{$number}/status", ['status' => 'confirmed'])
             ->assertOk();

        $this->assertDatabaseHas('orders', ['number' => $number, 'status' => 'confirmed']);
        $this->assertDatabaseHas('order_status_histories', ['order_id' => $order->id, 'status' => 'confirmed']);
    }

    public function test_admin_cannot_make_invalid_status_transition(): void
    {
        $data = $this->prepareClientWithCart();
        $resp = $this->postJson('/api/v1/orders', [
            'address_id'       => $data['address']->id,
            'delivery_zone_id' => $data['zone']->id,
        ]);
        $number = $resp->json('data.number');

        $this->actingAsAdmin();

        // On ne peut pas passer de pending_payment à delivered directement
        $this->putJson("/api/v1/admin/orders/{$number}/status", ['status' => 'delivered'])
             ->assertStatus(422);
    }
}
