<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\UserResource;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ClientController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = User::where('role', 'client');

        if ($search = $request->query('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('email', 'like', "%{$search}%")
                  ->orWhere('first_name', 'like', "%{$search}%")
                  ->orWhere('last_name', 'like', "%{$search}%");
            });
        }

        $clients = $query->latest()->paginate(15);

        return response()->json(UserResource::collection($clients)->response()->getData(true));
    }

    public function show(int $id): JsonResponse
    {
        $client = User::where('id', $id)->where('role', 'client')->withCount('orders')->firstOrFail();

        $totalSpent = $client->orders()
            ->whereIn('status', ['received', 'confirmed', 'preparing', 'shipped', 'delivered'])
            ->sum('total');

        return response()->json([
            'user'        => new UserResource($client),
            'orders_count' => $client->orders_count,
            'total_spent'  => $totalSpent,
            'orders'       => $client->orders()->with('deliveryZone')->latest()->take(10)->get()->map(fn ($o) => [
                'number'     => $o->number,
                'status'     => $o->status,
                'total'      => $o->total,
                'created_at' => $o->created_at->toDateTimeString(),
            ]),
        ]);
    }

    public function toggle(int $id): JsonResponse
    {
        $client = User::where('id', $id)->where('role', 'client')->firstOrFail();
        $client->update(['is_active' => ! $client->is_active]);

        $state = $client->is_active ? 'activé' : 'désactivé';

        return response()->json([
            'message'   => "Compte {$state}.",
            'is_active' => $client->is_active,
        ]);
    }
}
