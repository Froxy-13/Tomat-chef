<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\ChangePasswordRequest;
use App\Http\Requests\UpdateProfileRequest;
use App\Http\Resources\UserResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;

class ProfileController extends Controller
{
    public function show(Request $request): JsonResponse
    {
        return response()->json(new UserResource($request->user()));
    }

    public function update(UpdateProfileRequest $request): JsonResponse
    {
        $request->user()->update($request->validated());

        return response()->json(new UserResource($request->user()->fresh()));
    }

    public function changePassword(ChangePasswordRequest $request): JsonResponse
    {
        $user = $request->user();

        if (! Hash::check($request->current_password, $user->password)) {
            return response()->json([
                'message' => 'Les données fournies sont invalides.',
                'errors'  => ['current_password' => ['Le mot de passe actuel est incorrect.']],
            ], 422);
        }

        $user->update(['password' => $request->password]);

        return response()->json(['message' => 'Mot de passe modifié avec succès.']);
    }

    public function updateAvatar(Request $request): JsonResponse
    {
        $request->validate([
            'avatar' => ['required', 'image', 'mimes:jpeg,png,jpg,webp', 'max:2048'],
        ], [
            'avatar.required' => 'Une photo est requise.',
            'avatar.image'    => 'Le fichier doit être une image.',
            'avatar.max'      => 'L\'image ne doit pas dépasser 2 Mo.',
        ]);

        $user = $request->user();

        if ($user->avatar) {
            Storage::disk('public')->delete($user->avatar);
        }

        $path = $request->file('avatar')->store('avatars', 'public');

        $this->resizeImage(Storage::disk('public')->path($path), 200, 200);

        $user->update(['avatar' => $path]);

        return response()->json([
            'message' => 'Photo de profil mise à jour.',
            'avatar'  => asset('storage/' . $path),
        ]);
    }

    public function destroy(Request $request): JsonResponse
    {
        $user = $request->user();
        $user->currentAccessToken()->delete();
        $user->delete();

        return response()->json(['message' => 'Compte supprimé.']);
    }

    private function resizeImage(string $path, int $width, int $height): void
    {
        if (! function_exists('imagecreatefromjpeg')) {
            return;
        }

        $info = @getimagesize($path);
        if (! $info) {
            return;
        }

        $src = match ($info['mime']) {
            'image/jpeg' => @imagecreatefromjpeg($path),
            'image/png'  => @imagecreatefrompng($path),
            'image/webp' => @imagecreatefromwebp($path),
            default      => null,
        };

        if (! $src) {
            return;
        }

        $dst = imagecreatetruecolor($width, $height);
        imagecopyresampled($dst, $src, 0, 0, 0, 0, $width, $height, imagesx($src), imagesy($src));

        match ($info['mime']) {
            'image/jpeg' => imagejpeg($dst, $path, 85),
            'image/png'  => imagepng($dst, $path),
            'image/webp' => imagewebp($dst, $path, 85),
            default      => null,
        };

        imagedestroy($src);
        imagedestroy($dst);
    }
}
