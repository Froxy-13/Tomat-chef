<?php

namespace App\Services;

use App\Contracts\PaymentGateway;
use Illuminate\Validation\ValidationException;

class FakeCardGateway implements PaymentGateway
{
    private const DECLINED_CARD = '4000000000000002';

    public function charge(array $cardData, int $amount): array
    {
        $this->validateCard($cardData);

        $number = preg_replace('/\s+/', '', $cardData['card_number']);
        $status = ($number === self::DECLINED_CARD) ? 'declined' : 'accepted';

        return [
            'status'    => $status,
            'reference' => 'PAY-' . time() . '-' . strtoupper(substr(md5(uniqid()), 0, 4)),
            'last4'     => substr($number, -4),
            'brand'     => $this->detectBrand($number),
        ];
    }

    private function validateCard(array $data): void
    {
        $number = preg_replace('/\s+/', '', $data['card_number'] ?? '');

        if (! preg_match('/^\d{16}$/', $number)) {
            throw ValidationException::withMessages([
                'card_number' => ['Le numéro de carte doit contenir 16 chiffres.'],
            ]);
        }

        if (! $this->luhnCheck($number)) {
            throw ValidationException::withMessages([
                'card_number' => ['Numéro de carte invalide.'],
            ]);
        }

        if (! preg_match('/^\d{3}$/', $data['cvv'] ?? '')) {
            throw ValidationException::withMessages([
                'cvv' => ['Le CVV doit contenir 3 chiffres.'],
            ]);
        }

        if (! preg_match('/^(0[1-9]|1[0-2])\/\d{2}$/', $data['expiry'] ?? '')) {
            throw ValidationException::withMessages([
                'expiry' => ['La date d\'expiration doit être au format MM/AA.'],
            ]);
        }

        [$month, $year] = explode('/', $data['expiry']);
        $expiry = \Carbon\Carbon::createFromDate(2000 + (int) $year, (int) $month, 1)->endOfMonth();

        if ($expiry->isPast()) {
            throw ValidationException::withMessages([
                'expiry' => ['La carte est expirée.'],
            ]);
        }
    }

    private function luhnCheck(string $number): bool
    {
        $sum = 0;
        $alt = false;

        for ($i = strlen($number) - 1; $i >= 0; $i--) {
            $digit = (int) $number[$i];

            if ($alt) {
                $digit *= 2;
                if ($digit > 9) {
                    $digit -= 9;
                }
            }

            $sum += $digit;
            $alt = ! $alt;
        }

        return $sum % 10 === 0;
    }

    private function detectBrand(string $number): string
    {
        return match (true) {
            str_starts_with($number, '4') => 'Visa',
            str_starts_with($number, '5') => 'Mastercard',
            default                        => 'Autre',
        };
    }
}
