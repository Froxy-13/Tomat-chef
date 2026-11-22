<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Review;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class ReviewController extends Controller
{
    // GET /reviews — public, derniers avis publiés
    public function index(): JsonResponse
    {
        $reviews = Review::with('user')
            ->where('is_published', true)
            ->latest()
            ->limit(10)
            ->get()
            ->map(fn ($r) => [
                'id'         => $r->id,
                'rating'     => $r->rating,
                'comment'    => $r->comment,
                'created_at' => $r->created_at->toDateString(),
                'user_name'  => $r->user
                    ? trim(($r->user->first_name ?? '') . ' ' . substr($r->user->last_name ?? '', 0, 1) . '.')
                    : 'Client',
            ]);

        return response()->json($reviews);
    }

    // POST /orders/{number}/review — client authentifié
    public function store(Request $request, string $number): JsonResponse
    {
        $data = $request->validate([
            'rating'  => ['required', 'integer', 'min:1', 'max:5'],
            'comment' => ['nullable', 'string', 'max:1000'],
        ], [
            'rating.required' => 'La note est obligatoire.',
            'rating.min'      => 'La note minimale est 1.',
            'rating.max'      => 'La note maximale est 5.',
        ]);

        $order = Order::where('number', $number)
            ->where('user_id', $request->user()->id)
            ->firstOrFail();

        if ($order->status !== 'delivered') {
            return response()->json([
                'message' => 'Vous ne pouvez laisser un avis que pour une commande livrée.',
            ], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        $existing = Review::where('order_id', $order->id)
            ->where('user_id', $request->user()->id)
            ->exists();

        if ($existing) {
            return response()->json([
                'message' => 'Vous avez déjà laissé un avis pour cette commande.',
            ], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        $review = Review::create([
            'user_id'  => $request->user()->id,
            'order_id' => $order->id,
            'rating'   => $data['rating'],
            'comment'  => $data['comment'] ?? null,
        ]);

        return response()->json([
            'message' => 'Avis enregistré, merci !',
            'review'  => [
                'id'     => $review->id,
                'rating' => $review->rating,
            ],
        ], Response::HTTP_CREATED);
    }
}
