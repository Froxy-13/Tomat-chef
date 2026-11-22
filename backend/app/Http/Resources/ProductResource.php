<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProductResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'          => $this->id,
            'name'        => $this->name,
            'slug'        => $this->slug,
            'description' => $this->description,
            'price'       => $this->price,
            'stock'       => $this->stock,
            'weight'      => $this->weight,
            'is_active'   => $this->is_active,
            'images'      => ProductImageResource::collection($this->whenLoaded('images')),
        ];
    }
}
