<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\AddressRequest;
use App\Http\Resources\AddressResource;
use App\Models\Address;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class AddressController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $addresses = $request->user()->addresses()->orderByDesc('is_default')->get();

        return response()->json(AddressResource::collection($addresses));
    }

    public function store(AddressRequest $request): JsonResponse
    {
        $user = $request->user();
        $data = $request->validated();

        if (! empty($data['is_default'])) {
            $user->addresses()->update(['is_default' => false]);
        }

        if ($user->addresses()->count() === 0) {
            $data['is_default'] = true;
        }

        $address = $user->addresses()->create($data);

        return response()->json(new AddressResource($address), Response::HTTP_CREATED);
    }

    public function update(AddressRequest $request, Address $address): JsonResponse
    {
        $this->authorizeAddress($request, $address);

        $data = $request->validated();

        if (! empty($data['is_default'])) {
            $request->user()->addresses()->where('id', '!=', $address->id)->update(['is_default' => false]);
        }

        $address->update($data);

        return response()->json(new AddressResource($address->fresh()));
    }

    public function destroy(Request $request, Address $address): JsonResponse
    {
        $this->authorizeAddress($request, $address);

        $user = $request->user();
        $count = $user->addresses()->count();

        if ($address->is_default && $count === 1) {
            return response()->json([
                'message' => 'Impossible de supprimer votre seule adresse par défaut.',
            ], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        $address->delete();

        if ($address->is_default && $count > 1) {
            $user->addresses()->oldest()->first()?->update(['is_default' => true]);
        }

        return response()->json(['message' => 'Adresse supprimée.']);
    }

    private function authorizeAddress(Request $request, Address $address): void
    {
        if ($address->user_id !== $request->user()->id) {
            abort(Response::HTTP_FORBIDDEN, 'Accès refusé.');
        }
    }
}
