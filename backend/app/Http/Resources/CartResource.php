<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CartResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $items = $this->whenLoaded('items');
        $total = 0;

        if ($items instanceof \Illuminate\Support\Collection) {
            $total = $items->sum(fn ($item) => $item->product ? $item->product->price * $item->quantity : 0);
        }

        return [
            'id'    => $this->id,
            'items' => CartItemResource::collection($this->whenLoaded('items')),
            'total' => $total,
        ];
    }
}
