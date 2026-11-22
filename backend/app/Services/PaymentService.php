<?php

namespace App\Services;

use App\Contracts\PaymentGateway;
use App\Models\Order;
use App\Models\OrderStatusHistory;
use App\Models\Transaction;
use Illuminate\Support\Facades\DB;

class PaymentService
{
    public function __construct(
        private readonly PaymentGateway $gateway,
        private readonly OrderService $orderService,
    ) {}

    public function process(Order $order, array $cardData): Transaction
    {
        if ($order->status !== 'pending_payment') {
            throw new \RuntimeException('Cette commande ne peut plus être payée.');
        }

        if ($order->transaction()->where('status', 'accepted')->exists()) {
            throw new \RuntimeException('Cette commande a déjà été payée.');
        }

        $result = $this->gateway->charge($cardData, $order->total);

        return DB::transaction(function () use ($order, $result) {
            $transaction = Transaction::create([
                'order_id'   => $order->id,
                'reference'  => $result['reference'],
                'amount'     => $order->total,
                'status'     => $result['status'],
                'card_last4' => $result['last4'] ?? null,
                'card_brand' => $result['brand'] ?? null,
            ]);

            if ($result['status'] === 'accepted') {
                $order->update(['status' => 'received']);

                OrderStatusHistory::create([
                    'order_id' => $order->id,
                    'status'   => 'received',
                ]);

                $order->load('items.product');
                $this->orderService->confirmStockDecrement($order);
            }

            return $transaction;
        });
    }
}
