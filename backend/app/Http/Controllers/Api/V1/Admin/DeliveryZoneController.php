<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Models\DeliveryZone;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class DeliveryZoneController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json(DeliveryZone::all());
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name'      => ['required', 'string', 'max:150', 'unique:delivery_zones,name'],
            'fee'       => ['required', 'integer', 'min:0'],
            'is_active' => ['boolean'],
        ], [
            'name.required' => 'Le nom de la zone est obligatoire.',
            'name.unique'   => 'Une zone avec ce nom existe déjà.',
            'fee.required'  => 'Les frais de livraison sont obligatoires.',
            'fee.integer'   => 'Les frais doivent être un entier (en FCFA).',
        ]);

        $zone = DeliveryZone::create($data);

        return response()->json($zone, Response::HTTP_CREATED);
    }

    public function update(Request $request, DeliveryZone $deliveryZone): JsonResponse
    {
        $data = $request->validate([
            'name'      => ['required', 'string', 'max:150', 'unique:delivery_zones,name,' . $deliveryZone->id],
            'fee'       => ['required', 'integer', 'min:0'],
            'is_active' => ['boolean'],
        ]);

        $deliveryZone->update($data);

        return response()->json($deliveryZone->fresh());
    }

    public function destroy(DeliveryZone $deliveryZone): JsonResponse
    {
        $deliveryZone->delete();

        return response()->json(['message' => 'Zone supprimée.']);
    }
}
