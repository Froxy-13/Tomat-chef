<?php

use Illuminate\Support\Facades\Route;

Route::get('/', fn () => response()->json(['name' => "Tomat'chef API", 'version' => 'v1']));

// Routes nommées requises par les middlewares Laravel (retournent du JSON au lieu de rediriger)
Route::get('/login', fn () => response()->json(['message' => 'Non authentifié.'], 401))->name('login');
Route::get('/password/reset', fn () => response()->json(['message' => 'Non authentifié.'], 401))->name('password.reset');
