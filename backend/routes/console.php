<?php

use App\Models\Order;
use App\Models\OrderStatusHistory;
use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

Artisan::command('orders:cancel-expired', function () {
    $expired = Order::where('status', 'pending_payment')
        ->where('expires_at', '<', now())
        ->get();

    $count = 0;
    foreach ($expired as $order) {
        $order->update(['status' => 'cancelled']);

        OrderStatusHistory::create([
            'order_id' => $order->id,
            'user_id'  => null,
            'status'   => 'cancelled',
            'note'     => 'Annulation automatique : délai de paiement dépassé.',
        ]);

        $count++;
    }

    $this->info("{$count} commande(s) expirée(s) annulée(s).");
})->purpose('Annuler les commandes en attente de paiement depuis plus de 30 minutes');

Schedule::command('orders:cancel-expired')->everyMinute();
