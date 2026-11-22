<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Recipe;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class RecipeController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Recipe::where('is_published', true);

        if ($request->has('category')) {
            $query->where('category', $request->category);
        }
        if ($request->boolean('featured')) {
            $query->where('featured', true);
        }

        $recipes = $query->latest()->get()->map(fn($r) => $this->summary($r));

        return response()->json(['data' => $recipes]);
    }

    public function show(string $slug): JsonResponse
    {
        $recipe = Recipe::where('slug', $slug)->where('is_published', true)->firstOrFail();
        return response()->json(['data' => $recipe]);
    }

    private function summary(Recipe $r): array
    {
        return [
            'id'              => $r->id,
            'slug'            => $r->slug,
            'title'           => $r->title,
            'subtitle'        => $r->subtitle,
            'category'        => $r->category,
            'prep_time'       => $r->prep_time,
            'cook_time'       => $r->cook_time,
            'difficulty'      => $r->difficulty,
            'servings'        => $r->servings,
            'tomato_quantity' => $r->tomato_quantity,
            'image'           => $r->image,
            'featured'        => $r->featured,
        ];
    }
}
