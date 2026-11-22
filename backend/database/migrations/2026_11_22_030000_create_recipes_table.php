<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('recipes', function (Blueprint $table) {
            $table->id();
            $table->string('slug')->unique();
            $table->string('title');
            $table->text('subtitle');
            $table->enum('category', ['Africaine', 'Méditerranéenne', 'Familiale', 'Rapide']);
            $table->string('prep_time');
            $table->string('cook_time');
            $table->enum('difficulty', ['Facile', 'Moyen', 'Expert']);
            $table->unsignedTinyInteger('servings');
            $table->string('tomato_quantity');
            $table->string('image')->nullable();
            $table->boolean('featured')->default(false);
            $table->json('ingredients');
            $table->json('steps');
            $table->text('chef_notes');
            $table->text('nutrition_highlight');
            $table->boolean('is_published')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('recipes');
    }
};
