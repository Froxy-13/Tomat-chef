<?php

namespace App\Services;

use App\Models\Order;
use App\Models\User;

class LoyaltyService
{
    /* ── Paliers ─────────────────────────────────────────── */
    public static function tiers(): array
    {
        return [
            [
                'name'            => "Graine Gourmande",
                'level'           => 1,
                'min_points'      => 0,
                'discount_pct'    => 5,
                'pts_per_1000'    => 10,
                'benefits'        => [
                    "1 000 FCFA dépensés = 10 points Tomat'",
                    "-5% sur toute la boutique dès l'inscription",
                    "Accès aux recettes exclusives du blog",
                    "Offre de bienvenue : -10% avec le code BIENVENUE10",
                ],
            ],
            [
                'name'            => "Pousse Culinaire",
                'level'           => 2,
                'min_points'      => 500,
                'discount_pct'    => 10,
                'pts_per_1000'    => 12,
                'benefits'        => [
                    "1 000 FCFA dépensés = 12 points Tomat'",
                    "-10% permanent sur tous vos paniers",
                    "Frais de livraison offerts dès 20 000 FCFA",
                    "Cadeau gourmand offert pour votre anniversaire",
                    "Accès anticipé aux ventes privées",
                ],
            ],
            [
                'name'            => "Chef Étoile",
                'level'           => 3,
                'min_points'      => 1500,
                'discount_pct'    => 15,
                'pts_per_1000'    => 15,
                'benefits'        => [
                    "1 000 FCFA dépensés = 15 points Tomat'",
                    "-15% permanent sur toute la collection",
                    "Livraison express 24h gratuite sans minimum",
                    "Tablier brodé en lin officiel Tomat'Chef offert",
                    "Invitations VIP aux masterclasses culinaires",
                ],
            ],
        ];
    }

    /* ── Récompenses ─────────────────────────────────────── */
    public static function rewards(): array
    {
        return [
            ['id' => 'rew-3000fcfa',  'title' => "Bon d'achat 3 000 FCFA",        'points' => 300,  'description' => "Valable sur tout panier dès 15 000 FCFA.", 'code' => 'BON3000'],
            ['id' => 'rew-free-can',  'title' => "1 Boîte 400g Tomat'Chef offerte", 'points' => 500,  'description' => "Ajoutez une boîte 400g gratuitement.",       'code' => 'CADEAU400'],
            ['id' => 'rew-10000fcfa', 'title' => "Bon d'achat 10 000 FCFA",        'points' => 900,  'description' => "Remise immédiate sur votre commande.",        'code' => 'CHEF10000'],
            ['id' => 'rew-tablier',   'title' => "Tablier de Chef Tomat'Chef",      'points' => 1400, 'description' => "Tablier professionnel brodé en coton lourd.", 'code' => 'TABLIERPRO'],
        ];
    }

    /* ── Palier d'un utilisateur ─────────────────────────── */
    public static function tierFor(int $points): array
    {
        $tiers = self::tiers();
        if ($points >= 1500) return $tiers[2];
        if ($points >= 500)  return $tiers[1];
        return $tiers[0];
    }

    /* ── Points gagnés sur une commande ─────────────────── */
    public static function pointsForOrder(Order $order): int
    {
        $tier = self::tierFor($order->user?->loyalty_points ?? 0);
        return (int) floor($order->total / 1000) * $tier['pts_per_1000'];
    }

    /* ── Attribuer les points (livraison) ────────────────── */
    public static function awardForOrder(Order $order): void
    {
        if ($order->loyalty_points_earned !== null) return; // déjà attribués
        if (!$order->user_id) return;

        $pts = self::pointsForOrder($order);
        if ($pts <= 0) return;

        User::where('id', $order->user_id)->increment('loyalty_points', $pts);
        $order->update(['loyalty_points_earned' => $pts]);
    }
}
