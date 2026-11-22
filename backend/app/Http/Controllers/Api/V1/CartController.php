<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\CartResource;
use App\Models\Cart;
use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CartController extends Controller
{
    public function show(Request $request): JsonResponse
    {
        $cart = $this->getOrCreateCart($request->user());
        $cart->load('items.product.images');

        return response()->json(new CartResource($cart));
    }

    public function addItem(Request $request): JsonResponse
    {
        $data = $request->validate([
            'product_id' => ['required', 'integer', 'exists:products,id'],
            'quantity'   => ['required', 'integer', 'min:1'],
        ], [
            'product_id.required' => 'L\'identifiant du produit est obligatoire.',
            'product_id.exists'   => 'Produit introuvable.',
            'quantity.required'   => 'La quantité est obligatoire.',
            'quantity.min'        => 'La quantité doit être au moins 1.',
        ]);

        $product = Product::where('id', $data['product_id'])->where('is_active', true)->firstOrFail();

        if ($data['quantity'] > $product->stock) {
            return response()->json([
                'message' => "Stock insuffisant. Disponible : {$product->stock}.",
            ], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        $cart = $this->getOrCreateCart($request->user());
        $existing = $cart->items()->where('product_id', $product->id)->first();

        if ($existing) {
            $newQty = $existing->quantity + $data['quantity'];

            if ($newQty > $product->stock) {
                return response()->json([
                    'message' => "Stock insuffisant. Disponible : {$product->stock}.",
                ], Response::HTTP_UNPROCESSABLE_ENTITY);
            }

            $existing->update(['quantity' => $newQty]);
        } else {
            $cart->items()->create([
                'product_id' => $product->id,
                'quantity'   => $data['quantity'],
            ]);
        }

        $cart->load('items.product.images');

        return response()->json(new CartResource($cart));
    }

    public function updateItem(Request $request, int $productId): JsonResponse
    {
        $data = $request->validate([
            'quantity' => ['required', 'integer', 'min:1'],
        ], [
            'quantity.required' => 'La quantité est obligatoire.',
            'quantity.min'      => 'La quantité doit être au moins 1.',
        ]);

        $product = Product::where('id', $productId)->where('is_active', true)->firstOrFail();

        if ($data['quantity'] > $product->stock) {
            return response()->json([
                'message' => "Stock insuffisant. Disponible : {$product->stock}.",
            ], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        $cart = $this->getOrCreateCart($request->user());
        $item = $cart->items()->where('product_id', $productId)->firstOrFail();
        $item->update(['quantity' => $data['quantity']]);

        $cart->load('items.product.images');

        return response()->json(new CartResource($cart));
    }

    public function removeItem(Request $request, int $productId): JsonResponse
    {
        $cart = $this->getOrCreateCart($request->user());
        $cart->items()->where('product_id', $productId)->delete();

        $cart->load('items.product.images');

        return response()->json(new CartResource($cart));
    }

    public function clear(Request $request): JsonResponse
    {
        $cart = $this->getOrCreateCart($request->user());
        $cart->items()->delete();

        return response()->json(['message' => 'Panier vidé.']);
    }

    private function getOrCreateCart($user): Cart
    {
        return Cart::firstOrCreate(['user_id' => $user->id]);
    }
}
