<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\ProductResource;
use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Product::with('images')->where('is_active', true);

        if ($search = $request->query('search')) {
            $query->where('name', 'like', "%{$search}%");
        }

        $sort = $request->query('sort', 'created_at_desc');
        $query->when($sort === 'price_asc', fn ($q) => $q->orderBy('price'))
              ->when($sort === 'price_desc', fn ($q) => $q->orderByDesc('price'))
              ->when(! in_array($sort, ['price_asc', 'price_desc']), fn ($q) => $q->latest());

        $products = $query->paginate(12);

        return response()->json(ProductResource::collection($products)->response()->getData(true));
    }

    public function show(string $slug): JsonResponse
    {
        $product = Product::with('images')->where('slug', $slug)->where('is_active', true)->firstOrFail();

        return (new ProductResource($product))->response();
    }
}
