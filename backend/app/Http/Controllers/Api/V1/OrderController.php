<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\CreateOrderRequest;
use App\Http\Resources\OrderResource;
use App\Models\Address;
use App\Models\DeliveryZone;
use App\Models\Order;
use App\Services\OrderService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class OrderController extends Controller
{
    public function __construct(private readonly OrderService $orderService) {}

    public function index(Request $request): JsonResponse
    {
        $orders = $request->user()
            ->orders()
            ->with('deliveryZone')
            ->latest()
            ->paginate(10);

        return response()->json(OrderResource::collection($orders)->response()->getData(true));
    }

    public function store(CreateOrderRequest $request): JsonResponse
    {
        $user    = $request->user();
        $address = Address::findOrFail($request->address_id);
        $zone    = DeliveryZone::findOrFail($request->delivery_zone_id);

        try {
            $order = $this->orderService->createFromCart($user, $address, $zone);
        } catch (\RuntimeException $e) {
            return response()->json(['message' => $e->getMessage()], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        $order->load(['items', 'deliveryZone']);

        return (new OrderResource($order))->response()->setStatusCode(Response::HTTP_CREATED);
    }

    public function show(Request $request, string $number): JsonResponse
    {
        $order = Order::with(['items', 'deliveryZone', 'statusHistories', 'transaction'])
            ->where('number', $number)
            ->where('user_id', $request->user()->id)
            ->firstOrFail();

        return (new OrderResource($order))->response();
    }
}
