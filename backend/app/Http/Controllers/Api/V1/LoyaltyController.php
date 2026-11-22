<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Services\LoyaltyService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class LoyaltyController extends Controller
{
    public function status(Request $request): JsonResponse
    {
        $user   = $request->user();
        $points = $user->loyalty_points ?? 0;
        $tier   = LoyaltyService::tierFor($points);
        $tiers  = LoyaltyService::tiers();

        $nextTier = collect($tiers)->first(fn($t) => $t['level'] > $tier['level']);
        $nextMin  = $nextTier ? $nextTier['min_points'] : null;
        $pct      = $nextMin ? min(100, (int) round($points / $nextMin * 100)) : 100;

        return response()->json([
            'points'          => $points,
            'tier'            => $tier,
            'next_tier'       => $nextTier,
            'progress_pct'    => $pct,
            'tiers'           => $tiers,
            'rewards'         => LoyaltyService::rewards(),
        ]);
    }

    public function redeem(Request $request): JsonResponse
    {
        $data = $request->validate([
            'reward_id' => 'required|string',
        ]);

        $user    = $request->user();
        $points  = $user->loyalty_points ?? 0;
        $rewards = LoyaltyService::rewards();
        $reward  = collect($rewards)->firstWhere('id', $data['reward_id']);

        if (!$reward) {
            return response()->json(['message' => 'Récompense introuvable.'], 404);
        }

        if ($points < $reward['points']) {
            return response()->json([
                'message' => "Il vous manque " . ($reward['points'] - $points) . " points pour débloquer cette récompense.",
            ], 422);
        }

        $user->decrement('loyalty_points', $reward['points']);

        return response()->json([
            'code'    => $reward['code'],
            'message' => "Récompense débloquée ! Votre code promo : {$reward['code']}",
            'points_spent'     => $reward['points'],
            'points_remaining' => $user->fresh()->loyalty_points,
        ]);
    }
}
