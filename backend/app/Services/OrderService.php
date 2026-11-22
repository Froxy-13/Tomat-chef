<?php

namespace App\Services;

use App\Models\Address;
use App\Models\DeliveryZone;
use App\Models\Order;
use App\Models\OrderStatusHistory;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class OrderService
{
    public function createFromCart(User $user, Address $address, DeliveryZone $zone): Order
    {
        $cart = $user->cart()->with('items.product')->firstOrFail();

        if ($cart->items->isEmpty()) {
            throw new \RuntimeException('Le panier est vide.');
        }

        return DB::transaction(function () use ($user, $address, $zone, $cart) {
            $subtotal = 0;
            $lines = [];

            foreach ($cart->items as $item) {
                $product = $item->product;

                if (! $product || ! $product->is_active) {
                    throw new \RuntimeException("Le produit \"{$item->product_id}\" n'est plus disponible.");
                }

                if ($product->stock < $item->quantity) {
                    throw new \RuntimeException("Stock insuffisant pour \"{$product->name}\".");
                }

                $lineSubtotal = $product->price * $item->quantity;
                $subtotal += $lineSubtotal;

                $lines[] = [
                    'product_id'   => $product->id,
                    'product_name' => $product->name,
                    'unit_price'   => $product->price,
                    'quantity'     => $item->quantity,
                    'subtotal'     => $lineSubtotal,
                ];
            }

            $deliveryFee = $zone->fee;
            $total = $subtotal + $deliveryFee;

            $order = Order::create([
                'number'               => $this->generateOrderNumber(),
                'user_id'              => $user->id,
                'delivery_zone_id'     => $zone->id,
                'address_label'        => $address->label,
                'address_city'         => $address->city,
                'address_neighborhood' => $address->neighborhood,
                'address_landmark'     => $address->landmark,
                'address_phone'        => $address->phone,
                'subtotal'             => $subtotal,
                'delivery_fee'         => $deliveryFee,
                'total'                => $total,
                'status'               => 'pending_payment',
                'expires_at'           => now()->addMinutes(30),
            ]);

            $order->items()->createMany($lines);

            OrderStatusHistory::create([
                'order_id' => $order->id,
                'user_id'  => $user->id,
                'status'   => 'pending_payment',
            ]);

            $cart->items()->delete();

            return $order;
        });
    }

    public function confirmStockDecrement(Order $order): void
    {
        foreach ($order->items as $item) {
            if ($item->product) {
                $item->product->decrement('stock', $item->quantity);
            }
        }
    }

    public function restoreStock(Order $order): void
    {
        foreach ($order->items as $item) {
            if ($item->product) {
                $item->product->increment('stock', $item->quantity);
            }
        }
    }

    private function generateOrderNumber(): string
    {
        $date = now()->format('Ymd');
        $prefix = "TC-{$date}-";

        $last = Order::where('number', 'like', "{$prefix}%")
            ->orderByDesc('number')
            ->value('number');

        $sequence = $last ? ((int) substr($last, -4)) + 1 : 1;

        return $prefix . str_pad($sequence, 4, '0', STR_PAD_LEFT);
    }
}
