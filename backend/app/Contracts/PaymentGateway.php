<?php

namespace App\Contracts;

interface PaymentGateway
{
    public function charge(array $cardData, int $amount): array;
}
