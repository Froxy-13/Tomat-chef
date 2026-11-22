<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\OrderResource;
use App\Models\Order;
use App\Models\OrderStatusHistory;
use App\Services\OrderService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class OrderController extends Controller
{
    private const TRANSITIONS = [
        'received'        => ['confirmed', 'cancelled'],
        'confirmed'       => ['preparing', 'cancelled'],
        'preparing'       => ['shipped', 'cancelled'],
        'shipped'         => ['delivered', 'cancelled'],
        'delivered'       => ['cancelled'],
        'cancelled'       => ['refunded'],
    ];

    public function __construct(private readonly OrderService $orderService) {}

    public function index(Request $request): JsonResponse
    {
        $query = Order::with('user', 'deliveryZone')->latest();

        if ($status = $request->query('status')) {
            $query->where('status', $status);
        }

        if ($from = $request->query('from')) {
            $query->whereDate('created_at', '>=', $from);
        }

        if ($to = $request->query('to')) {
            $query->whereDate('created_at', '<=', $to);
        }

        $orders = $query->paginate(15);

        return response()->json(OrderResource::collection($orders)->response()->getData(true));
    }

    public function show(string $number): JsonResponse
    {
        $order = Order::with(['user', 'items', 'deliveryZone', 'statusHistories.author', 'transaction'])
            ->where('number', $number)
            ->firstOrFail();

        return (new OrderResource($order))->response();
    }

    public function updateStatus(Request $request, string $number): JsonResponse
    {
        $data = $request->validate([
            'status' => ['required', 'string'],
            'note'   => ['nullable', 'string', 'max:500'],
        ], [
            'status.required' => 'Le statut est obligatoire.',
        ]);

        $order  = Order::with('items.product')->where('number', $number)->firstOrFail();
        $newStatus = $data['status'];

        if ($order->status === 'pending_payment') {
            return response()->json([
                'message' => 'Impossible de changer manuellement le statut d\'une commande en attente de paiement.',
            ], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        $allowed = self::TRANSITIONS[$order->status] ?? [];

        if (! in_array($newStatus, $allowed)) {
            return response()->json([
                'message' => "Transition de statut invalide : {$order->status} → {$newStatus}.",
            ], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        // Remboursement ou annulation d'une commande payée : trouve la transaction acceptée
        if (in_array($newStatus, ['refunded', 'cancelled']) && $order->isPaid()) {
            $acceptedTx = $order->transactions()->where('status', 'accepted')->latest()->first();
            if ($acceptedTx) {
                $acceptedTx->update(['status' => 'refunded']);
                $this->orderService->restoreStock($order);
            }
        }

        $order->update(['status' => $newStatus]);

        OrderStatusHistory::create([
            'order_id' => $order->id,
            'user_id'  => $request->user()->id,
            'status'   => $newStatus,
            'note'     => $data['note'] ?? null,
        ]);

        return response()->json([
            'message' => 'Statut mis à jour.',
            'status'  => $newStatus,
        ]);
    }
}
