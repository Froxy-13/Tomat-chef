<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OrderResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'number'        => $this->number,
            'status'        => $this->status,
            'subtotal'      => $this->subtotal,
            'delivery_fee'  => $this->delivery_fee,
            'total'         => $this->total,
            'address'       => [
                'label'        => $this->address_label,
                'city'         => $this->address_city,
                'neighborhood' => $this->address_neighborhood,
                'landmark'     => $this->address_landmark,
                'phone'        => $this->address_phone,
            ],
            'delivery_zone' => $this->whenLoaded('deliveryZone', fn () => [
                'name' => $this->deliveryZone->name,
                'fee'  => $this->deliveryZone->fee,
            ]),
            'items'         => OrderItemResource::collection($this->whenLoaded('items')),
            'transaction'   => new TransactionResource($this->whenLoaded('transaction')),
            'status_history' => $this->whenLoaded('statusHistories', fn () =>
                $this->statusHistories->map(fn ($h) => [
                    'status'     => $h->status,
                    'note'       => $h->note,
                    'created_at' => $h->created_at->toDateTimeString(),
                ])
            ),
            'expires_at'    => $this->expires_at?->toDateTimeString(),
            'created_at'    => $this->created_at->toDateTimeString(),
        ];
    }
}
