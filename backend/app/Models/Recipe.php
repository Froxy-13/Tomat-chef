<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Recipe extends Model
{
    use HasFactory;

    protected $fillable = [
        'slug',
        'title',
        'subtitle',
        'category',
        'prep_time',
        'cook_time',
        'difficulty',
        'servings',
        'tomato_quantity',
        'image',
        'featured',
        'ingredients',
        'steps',
        'chef_notes',
        'nutrition_highlight',
        'is_published',
    ];

    protected function casts(): array
    {
        return [
            'featured'     => 'boolean',
            'is_published' => 'boolean',
            'servings'     => 'integer',
            'ingredients'  => 'array',
            'steps'        => 'array',
        ];
    }

    protected static function booted(): void
    {
        static::creating(function (Recipe $recipe) {
            if (empty($recipe->slug)) {
                $recipe->slug = Str::slug($recipe->title);
            }
        });
    }
}
