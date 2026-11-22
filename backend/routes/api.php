<?php

use App\Http\Controllers\Api\V1\Admin;
use App\Http\Controllers\Api\V1\Auth\AuthController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Routes publiques (non authentifiées)
|--------------------------------------------------------------------------
*/

// Catalogue produits
Route::get('/products', [\App\Http\Controllers\Api\V1\ProductController::class, 'index']);
Route::get('/products/{slug}', [\App\Http\Controllers\Api\V1\ProductController::class, 'show']);

// Avis clients (publics)
Route::get('/reviews', [\App\Http\Controllers\Api\V1\ReviewController::class, 'index']);

// Recettes (publiques)
Route::get('/recipes', [\App\Http\Controllers\Api\V1\RecipeController::class, 'index']);
Route::get('/recipes/{slug}', [\App\Http\Controllers\Api\V1\RecipeController::class, 'show']);

// Authentification client
Route::prefix('auth')->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login'])->middleware('throttle:5,1');
    Route::post('/forgot-password', [AuthController::class, 'forgotPassword']);
    Route::post('/reset-password', [AuthController::class, 'resetPassword']);
});

/*
|--------------------------------------------------------------------------
| Routes client (authentifié + rôle client)
|--------------------------------------------------------------------------
*/

Route::middleware(['auth:sanctum', 'role:client'])->group(function () {
    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/auth/logout', [AuthController::class, 'logout']);

    // Profil
    Route::prefix('profile')->group(function () {
        Route::get('/', [\App\Http\Controllers\Api\V1\ProfileController::class, 'show']);
        Route::put('/', [\App\Http\Controllers\Api\V1\ProfileController::class, 'update']);
        Route::put('/password', [\App\Http\Controllers\Api\V1\ProfileController::class, 'changePassword']);
        Route::post('/avatar', [\App\Http\Controllers\Api\V1\ProfileController::class, 'updateAvatar']);
        Route::delete('/', [\App\Http\Controllers\Api\V1\ProfileController::class, 'destroy']);
    });

    // Adresses
    Route::apiResource('addresses', \App\Http\Controllers\Api\V1\AddressController::class);

    // Panier
    Route::prefix('cart')->group(function () {
        Route::get('/', [\App\Http\Controllers\Api\V1\CartController::class, 'show']);
        Route::post('/items', [\App\Http\Controllers\Api\V1\CartController::class, 'addItem']);
        Route::put('/items/{productId}', [\App\Http\Controllers\Api\V1\CartController::class, 'updateItem']);
        Route::delete('/items/{productId}', [\App\Http\Controllers\Api\V1\CartController::class, 'removeItem']);
        Route::delete('/', [\App\Http\Controllers\Api\V1\CartController::class, 'clear']);
    });

    // Commandes
    Route::get('/orders', [\App\Http\Controllers\Api\V1\OrderController::class, 'index']);
    Route::post('/orders', [\App\Http\Controllers\Api\V1\OrderController::class, 'store']);
    Route::get('/orders/{number}', [\App\Http\Controllers\Api\V1\OrderController::class, 'show']);

    // Paiement
    Route::post('/orders/{number}/pay', [\App\Http\Controllers\Api\V1\PaymentController::class, 'pay']);

    // Avis
    Route::post('/orders/{number}/review', [\App\Http\Controllers\Api\V1\ReviewController::class, 'store']);

    // Fidélité
    Route::get('/loyalty',         [\App\Http\Controllers\Api\V1\LoyaltyController::class, 'status']);
    Route::post('/loyalty/redeem', [\App\Http\Controllers\Api\V1\LoyaltyController::class, 'redeem']);
});

/*
|--------------------------------------------------------------------------
| Routes admin (authentifié + rôle admin)
|--------------------------------------------------------------------------
*/

Route::prefix('admin')->middleware(['auth:sanctum', 'role:admin'])->group(function () {
    Route::post('/auth/logout', [Admin\AuthController::class, 'logout']);
    Route::get('/me', [Admin\AuthController::class, 'me']);

    // Dashboard
    Route::get('/dashboard', [Admin\DashboardController::class, 'index']);

    // Produits
    Route::apiResource('products', Admin\ProductController::class);
    Route::post('products/{id}/images', [Admin\ProductController::class, 'uploadImage']);
    Route::delete('products/{id}/images/{imageId}', [Admin\ProductController::class, 'deleteImage']);

    // Clients
    Route::get('/clients', [Admin\ClientController::class, 'index']);
    Route::get('/clients/{id}', [Admin\ClientController::class, 'show']);
    Route::put('/clients/{id}/toggle', [Admin\ClientController::class, 'toggle']);
    Route::delete('/clients/{id}', [Admin\ClientController::class, 'destroy']);

    // Zones de livraison
    Route::apiResource('delivery-zones', Admin\DeliveryZoneController::class);

    // Commandes
    Route::get('/orders', [Admin\OrderController::class, 'index']);
    Route::get('/orders/{number}', [Admin\OrderController::class, 'show']);
    Route::put('/orders/{number}/status', [Admin\OrderController::class, 'updateStatus']);

    // Recettes
    Route::apiResource('recipes', Admin\RecipeController::class);
});

// Connexion admin (sans auth)
Route::post('/admin/auth/login', [Admin\AuthController::class, 'login'])->middleware('throttle:5,1');

// Zones de livraison publiques
Route::get('/delivery-zones', [\App\Http\Controllers\Api\V1\DeliveryZoneController::class, 'index']);
