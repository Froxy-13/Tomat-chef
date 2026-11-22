<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TransactionResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'reference'  => $this->reference,
            'amount'     => $this->amount,
            'status'     => $this->status,
            'card_last4' => $this->card_last4,
            'card_brand' => $this->card_brand,
            'created_at' => $this->created_at->toDateTimeString(),
        ];
    }
}
