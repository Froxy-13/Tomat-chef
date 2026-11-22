<?php

namespace Tests\Feature;

use App\Models\Address;
use App\Models\Cart;
use App\Models\CartItem;
use App\Models\Order;
use Carbon\Carbon;
use Illuminate\Support\Facades\Artisan;
use Tests\TestCase;

class CancelExpiredOrdersTest extends TestCase
{
    private function createExpiredOrder(int $minutesAgo = 35): Order
    {
        $client  = $this->makeClient();
        $product = $this->makeProduct(['price' => 1000, 'stock' => 50]);
        $zone    = $this->makeZone(['fee' => 1500]);
        $address = Address::factory()->create(['user_id' => $client->id]);

        $cart = Cart::create(['user_id' => $client->id]);
        CartItem::create(['cart_id' => $cart->id, 'product_id' => $product->id, 'quantity' => 2]);

        $this->actingAs($client, 'sanctum');

        $response = $this->postJson('/api/v1/orders', [
            'address_id'       => $address->id,
            'delivery_zone_id' => $zone->id,
        ]);

        $number = $response->json('data.number');

        // Recule expires_at dans le passé
        Order::where('number', $number)->update([
            'expires_at' => Carbon::now()->subMinutes($minutesAgo),
        ]);

        return Order::where('number', $number)->first();
    }

    public function test_expired_pending_orders_are_cancelled(): void
    {
        $order = $this->createExpiredOrder(35);

        $this->assertEquals('pending_payment', $order->status);

        Artisan::call('orders:cancel-expired');

        $this->assertEquals('cancelled', $order->fresh()->status);
    }

    public function test_non_expired_orders_are_not_cancelled(): void
    {
        $order = $this->createExpiredOrder(-10); // expires dans 10 min (futur)

        // Remet expires_at dans le futur
        $order->update(['expires_at' => Carbon::now()->addMinutes(10)]);

        Artisan::call('orders:cancel-expired');

        $this->assertEquals('pending_payment', $order->fresh()->status);
    }

    public function test_already_paid_orders_are_not_cancelled(): void
    {
        $order = $this->createExpiredOrder(35);
        $order->update(['status' => 'received']);

        Artisan::call('orders:cancel-expired');

        $this->assertEquals('received', $order->fresh()->status);
    }

    public function test_cancellation_creates_status_history(): void
    {
        $order = $this->createExpiredOrder(35);

        Artisan::call('orders:cancel-expired');

        $this->assertDatabaseHas('order_status_histories', [
            'order_id' => $order->id,
            'status'   => 'cancelled',
            'user_id'  => null,
        ]);
    }

    public function test_command_reports_cancelled_count(): void
    {
        $this->createExpiredOrder(35);
        $this->createExpiredOrder(60);

        $exitCode = Artisan::call('orders:cancel-expired');
        $output   = Artisan::output();

        $this->assertEquals(0, $exitCode);
        $this->assertStringContainsString('2', $output);
    }
}
