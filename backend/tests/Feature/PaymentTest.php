<?php

namespace Tests\Feature;

use App\Models\Address;
use App\Models\Cart;
use App\Models\CartItem;
use App\Models\Order;
use Tests\TestCase;

class PaymentTest extends TestCase
{
    private function createPendingOrder(): array
    {
        $client  = $this->makeClient();
        $product = $this->makeProduct(['price' => 2000, 'stock' => 20]);
        $zone    = $this->makeZone(['fee' => 1000]);
        $address = Address::factory()->create(['user_id' => $client->id, 'is_default' => true]);

        $cart = Cart::create(['user_id' => $client->id]);
        CartItem::create(['cart_id' => $cart->id, 'product_id' => $product->id, 'quantity' => 2]);

        $this->actingAs($client, 'sanctum');

        $response = $this->postJson('/api/v1/orders', [
            'address_id'       => $address->id,
            'delivery_zone_id' => $zone->id,
        ]);

        $number = $response->json('data.number');
        $order  = Order::where('number', $number)->first();

        return compact('client', 'product', 'zone', 'order', 'number');
    }

    // -------------------------------------------------------------------------
    // Cartes de test
    // -------------------------------------------------------------------------

    public function test_accepted_card_completes_payment(): void
    {
        $data = $this->createPendingOrder();

        $this->postJson("/api/v1/orders/{$data['number']}/pay", [
            'card_number' => '4111111111111111',
            'card_name'   => 'Moussa Diallo',
            'expiry'      => '12/28',
            'cvv'         => '123',
        ])->assertOk()->assertJsonPath('transaction.status', 'accepted');

        $this->assertDatabaseHas('orders', [
            'number' => $data['number'],
            'status' => 'received',
        ]);
    }

    public function test_accepted_payment_decrements_stock(): void
    {
        $data          = $this->createPendingOrder();
        $stockBefore   = $data['product']->fresh()->stock;

        $this->postJson("/api/v1/orders/{$data['number']}/pay", [
            'card_number' => '4111111111111111',
            'card_name'   => 'Moussa Diallo',
            'expiry'      => '12/28',
            'cvv'         => '123',
        ])->assertOk();

        $this->assertEquals($stockBefore - 2, $data['product']->fresh()->stock);
    }

    public function test_declined_card_leaves_order_pending(): void
    {
        $data = $this->createPendingOrder();

        $this->postJson("/api/v1/orders/{$data['number']}/pay", [
            'card_number' => '4000000000000002',
            'card_name'   => 'Moussa Diallo',
            'expiry'      => '12/28',
            'cvv'         => '123',
        ])->assertOk()->assertJsonPath('transaction.status', 'declined');

        $this->assertDatabaseHas('orders', [
            'number' => $data['number'],
            'status' => 'pending_payment',
        ]);
    }

    public function test_expired_card_is_rejected(): void
    {
        $data = $this->createPendingOrder();

        $this->postJson("/api/v1/orders/{$data['number']}/pay", [
            'card_number' => '4111111111111111',
            'card_name'   => 'Moussa Diallo',
            'expiry'      => '01/20',
            'cvv'         => '123',
        ])->assertStatus(422);
    }

    public function test_luhn_invalid_card_is_rejected(): void
    {
        $data = $this->createPendingOrder();

        $this->postJson("/api/v1/orders/{$data['number']}/pay", [
            'card_number' => '1234567890123456',
            'card_name'   => 'Moussa Diallo',
            'expiry'      => '12/28',
            'cvv'         => '123',
        ])->assertStatus(422);
    }

    public function test_card_number_must_be_16_digits(): void
    {
        $data = $this->createPendingOrder();

        $this->postJson("/api/v1/orders/{$data['number']}/pay", [
            'card_number' => '411111111111',
            'card_name'   => 'Moussa Diallo',
            'expiry'      => '12/28',
            'cvv'         => '123',
        ])->assertStatus(422);
    }

    public function test_cvv_must_be_3_digits(): void
    {
        $data = $this->createPendingOrder();

        $this->postJson("/api/v1/orders/{$data['number']}/pay", [
            'card_number' => '4111111111111111',
            'card_name'   => 'Moussa Diallo',
            'expiry'      => '12/28',
            'cvv'         => '12',
        ])->assertStatus(422);
    }

    public function test_already_paid_order_cannot_be_paid_again(): void
    {
        $data = $this->createPendingOrder();

        // Premier paiement OK
        $this->postJson("/api/v1/orders/{$data['number']}/pay", [
            'card_number' => '4111111111111111',
            'card_name'   => 'Moussa Diallo',
            'expiry'      => '12/28',
            'cvv'         => '123',
        ])->assertOk();

        // Deuxième tentative → erreur
        $this->postJson("/api/v1/orders/{$data['number']}/pay", [
            'card_number' => '4111111111111111',
            'card_name'   => 'Moussa Diallo',
            'expiry'      => '12/28',
            'cvv'         => '123',
        ])->assertStatus(422);
    }

    public function test_card_number_is_never_stored(): void
    {
        $data = $this->createPendingOrder();

        $this->postJson("/api/v1/orders/{$data['number']}/pay", [
            'card_number' => '4111111111111111',
            'card_name'   => 'Moussa Diallo',
            'expiry'      => '12/28',
            'cvv'         => '123',
        ])->assertOk();

        // Seuls les 4 derniers chiffres sont stockés
        $this->assertDatabaseHas('transactions', ['card_last4' => '1111']);
        $this->assertDatabaseMissing('transactions', ['card_last4' => '4111111111111111']);
    }

    public function test_visa_card_brand_is_detected(): void
    {
        $data = $this->createPendingOrder();

        $this->postJson("/api/v1/orders/{$data['number']}/pay", [
            'card_number' => '4111111111111111',
            'card_name'   => 'Moussa Diallo',
            'expiry'      => '12/28',
            'cvv'         => '123',
        ])->assertOk()->assertJsonPath('transaction.card_brand', 'Visa');
    }

    // -------------------------------------------------------------------------
    // Remboursement admin
    // -------------------------------------------------------------------------

    public function test_admin_cancellation_of_paid_order_refunds_transaction(): void
    {
        $data = $this->createPendingOrder();

        // Payer la commande
        $this->postJson("/api/v1/orders/{$data['number']}/pay", [
            'card_number' => '4111111111111111',
            'card_name'   => 'Moussa Diallo',
            'expiry'      => '12/28',
            'cvv'         => '123',
        ])->assertOk();

        // Admin annule
        $this->actingAsAdmin();
        $this->putJson("/api/v1/admin/orders/{$data['number']}/status", [
            'status' => 'cancelled',
        ])->assertOk();

        $this->assertDatabaseHas('orders', ['number' => $data['number'], 'status' => 'cancelled']);
        $this->assertDatabaseHas('transactions', [
            'order_id' => $data['order']->id,
            'status'   => 'refunded',
        ]);
    }

    public function test_admin_cancellation_restores_stock(): void
    {
        $data        = $this->createPendingOrder();
        $stockBefore = $data['product']->fresh()->stock;

        // Payer
        $this->postJson("/api/v1/orders/{$data['number']}/pay", [
            'card_number' => '4111111111111111',
            'card_name'   => 'Moussa Diallo',
            'expiry'      => '12/28',
            'cvv'         => '123',
        ])->assertOk();

        $stockAfterPayment = $data['product']->fresh()->stock;
        $this->assertEquals($stockBefore - 2, $stockAfterPayment);

        // Admin annule
        $this->actingAsAdmin();
        $this->putJson("/api/v1/admin/orders/{$data['number']}/status", [
            'status' => 'cancelled',
        ])->assertOk();

        // Le stock doit être restauré
        $this->assertEquals($stockBefore, $data['product']->fresh()->stock);
    }
}
