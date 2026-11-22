<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('transactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained();
            $table->string('reference')->unique(); // référence interne
            $table->unsignedInteger('amount'); // FCFA
            $table->enum('status', ['pending', 'accepted', 'declined', 'refunded'])->default('pending');
            $table->string('card_last4', 4)->nullable();
            $table->string('card_brand', 20)->nullable(); // Visa, Mastercard
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('transactions');
    }
};
