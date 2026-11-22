<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Models\Recipe;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class RecipeController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Recipe::query();

        if ($request->has('category')) {
            $query->where('category', $request->category);
        }
        if ($request->has('published')) {
            $query->where('is_published', $request->boolean('published'));
        }

        $recipes = $query->latest()->get();
        return response()->json(['data' => $recipes]);
    }

    public function show(int $id): JsonResponse
    {
        return response()->json(['data' => Recipe::findOrFail($id)]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $this->validate($request);
        $recipe = Recipe::create($validated);
        return response()->json(['data' => $recipe], 201);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $recipe    = Recipe::findOrFail($id);
        $validated = $this->validate($request, $recipe);
        $recipe->update($validated);
        return response()->json(['data' => $recipe->fresh()]);
    }

    public function destroy(int $id): JsonResponse
    {
        Recipe::findOrFail($id)->delete();
        return response()->json(null, 204);
    }

    private function validate(Request $request, ?Recipe $recipe = null): array
    {
        $isUpdate = $recipe !== null;
        $rules = [
            'title'              => 'required|string|max:255',
            'subtitle'           => 'required|string',
            'category'           => ['required', Rule::in(['Africaine', 'Méditerranéenne', 'Familiale', 'Rapide'])],
            'prep_time'          => 'required|string|max:50',
            'cook_time'          => 'required|string|max:50',
            'difficulty'         => ['required', Rule::in(['Facile', 'Moyen', 'Expert'])],
            'servings'           => 'required|integer|min:1|max:50',
            'tomato_quantity'    => 'required|string|max:255',
            'image'              => 'nullable|string|max:500',
            'featured'           => 'boolean',
            'ingredients'        => 'required|array|min:1',
            'ingredients.*.name'   => 'required|string',
            'ingredients.*.amount' => 'required|string',
            'ingredients.*.isTomatoPaste' => 'nullable|boolean',
            'steps'              => 'required|array|min:1',
            'steps.*'            => 'required|string',
            'chef_notes'         => 'required|string',
            'nutrition_highlight'=> 'required|string',
            'is_published'       => 'boolean',
        ];

        $data = $request->validate($rules);

        if (!$isUpdate || $request->has('title')) {
            $baseSlug = Str::slug($data['title']);
            $slug     = $baseSlug;
            $counter  = 1;
            $q        = Recipe::where('slug', $slug);
            if ($isUpdate) $q->where('id', '!=', $recipe->id);
            while ($q->clone()->exists()) {
                $slug = "{$baseSlug}-{$counter}";
                $counter++;
            }
            $data['slug'] = $slug;
        }

        return $data;
    }
}
