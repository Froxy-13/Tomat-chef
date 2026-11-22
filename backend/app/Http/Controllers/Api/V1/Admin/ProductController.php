<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreProductRequest;
use App\Http\Resources\ProductResource;
use App\Models\Product;
use App\Models\ProductImage;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Symfony\Component\HttpFoundation\Response;

class ProductController extends Controller
{
    public function index(): JsonResponse
    {
        $products = Product::withTrashed()->with('images')->latest()->paginate(15);

        return response()->json(ProductResource::collection($products)->response()->getData(true));
    }

    public function store(StoreProductRequest $request): JsonResponse
    {
        $data         = $request->validated();
        $data['slug'] = Str::slug($data['name']);

        $base = $data['slug'];
        $i    = 1;
        while (Product::withTrashed()->where('slug', $data['slug'])->exists()) {
            $data['slug'] = $base . '-' . $i++;
        }

        $product = Product::create($data);

        return (new ProductResource($product->load('images')))->response()->setStatusCode(Response::HTTP_CREATED);
    }

    public function update(StoreProductRequest $request, Product $product): JsonResponse
    {
        $data = $request->validated();

        if ($data['name'] !== $product->name) {
            $data['slug'] = Str::slug($data['name']);
            $base = $data['slug'];
            $i = 1;
            while (Product::withTrashed()->where('slug', $data['slug'])->where('id', '!=', $product->id)->exists()) {
                $data['slug'] = $base . '-' . $i++;
            }
        }

        $product->update($data);

        return (new ProductResource($product->fresh()->load('images')))->response();
    }

    public function destroy(Product $product): JsonResponse
    {
        $product->delete();

        return response()->json(['message' => 'Produit supprimé.']);
    }

    public function uploadImage(Request $request, int $id): JsonResponse
    {
        $product = Product::withTrashed()->findOrFail($id);

        $request->validate([
            'image'  => ['required', 'image', 'mimes:jpeg,png,jpg,webp', 'max:4096'],
        ], [
            'image.required' => 'Une image est requise.',
            'image.image'    => 'Le fichier doit être une image.',
            'image.max'      => 'L\'image ne doit pas dépasser 4 Mo.',
        ]);

        $count = $product->images()->count();
        if ($count >= 5) {
            return response()->json(['message' => 'Maximum 5 images par produit.'], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        $path = $request->file('image')->store('products', 'public');

        $isPrimary = ($count === 0);

        $image = $product->images()->create([
            'path'       => $path,
            'is_primary' => $isPrimary,
            'sort_order' => $count,
        ]);

        return response()->json([
            'id'         => $image->id,
            'url'        => asset('storage/' . $path),
            'is_primary' => $isPrimary,
        ], Response::HTTP_CREATED);
    }

    public function deleteImage(int $id, int $imageId): JsonResponse
    {
        $product = Product::withTrashed()->findOrFail($id);
        $image   = ProductImage::where('id', $imageId)->where('product_id', $product->id)->firstOrFail();

        Storage::disk('public')->delete($image->path);
        $wasPrimary = $image->is_primary;
        $image->delete();

        if ($wasPrimary) {
            $product->images()->oldest()->first()?->update(['is_primary' => true]);
        }

        return response()->json(['message' => 'Image supprimée.']);
    }
}
