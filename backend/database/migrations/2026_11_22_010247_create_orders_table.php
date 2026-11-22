<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            $table->string('number')->unique(); // TC-20261122-0042
            $table->foreignId('user_id')->constrained();
            $table->foreignId('delivery_zone_id')->constrained();

            // Snapshot adresse au moment de la commande
            $table->string('address_label');
            $table->string('address_city');
            $table->string('address_neighborhood');
            $table->string('address_landmark')->nullable();
            $table->string('address_phone', 20);

            $table->unsignedInteger('subtotal'); // produits FCFA
            $table->unsignedInteger('delivery_fee'); // frais zone
            $table->unsignedInteger('total'); // subtotal + delivery_fee

            $table->enum('status', [
                'pending_payment',
                'received',
                'confirmed',
                'preparing',
                'shipped',
                'delivered',
                'cancelled',
                'refunded',
            ])->default('pending_payment');

            $table->timestamp('expires_at')->nullable(); // +30 min après création
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('orders');
    }
};
