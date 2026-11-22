<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    private const TVA_RATE = 0.18;

    public function index(): JsonResponse
    {
        $now         = now();
        $startMonth  = $now->copy()->startOfMonth();
        $startPrev   = $now->copy()->subMonth()->startOfMonth();
        $endPrev     = $now->copy()->subMonth()->endOfMonth();
        $start30     = $now->copy()->subDays(29)->startOfDay();

        // ── KPIs globaux ──
        $revenueTotal = Order::whereIn('status', ['delivered', 'confirmed', 'preparing', 'shipped'])
            ->sum('total');

        $revenueMonth = Order::whereIn('status', ['delivered', 'confirmed', 'preparing', 'shipped'])
            ->where('created_at', '>=', $startMonth)
            ->sum('total');

        $revenuePrev  = Order::whereIn('status', ['delivered', 'confirmed', 'preparing', 'shipped'])
            ->whereBetween('created_at', [$startPrev, $endPrev])
            ->sum('total');

        $ordersTotal  = Order::count();
        $ordersMonth  = Order::where('created_at', '>=', $startMonth)->count();
        $ordersPrev   = Order::whereBetween('created_at', [$startPrev, $endPrev])->count();

        $clientsTotal = User::where('role', 'client')->count();
        $clientsMonth = User::where('role', 'client')->where('created_at', '>=', $startMonth)->count();
        $clientsPrev  = User::where('role', 'client')->whereBetween('created_at', [$startPrev, $endPrev])->count();

        $avgOrder = $ordersTotal > 0 ? round($revenueTotal / $ordersTotal) : 0;

        $stockValue = Product::whereNull('deleted_at')
            ->get()
            ->sum(fn($p) => $p->stock * $p->price);

        // ── Revenus par jour (30 derniers jours) ──
        $revenueByDay = Order::whereIn('status', ['delivered', 'confirmed', 'preparing', 'shipped'])
            ->where('created_at', '>=', $start30)
            ->select(
                DB::raw("DATE(created_at) as date"),
                DB::raw("SUM(total) as revenue"),
                DB::raw("COUNT(*) as orders")
            )
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        // Fill missing days with 0
        $dayMap = $revenueByDay->keyBy('date');
        $days   = [];
        for ($i = 29; $i >= 0; $i--) {
            $d       = $now->copy()->subDays($i)->format('Y-m-d');
            $days[]  = [
                'date'    => $d,
                'revenue' => (int) ($dayMap[$d]->revenue ?? 0),
                'orders'  => (int) ($dayMap[$d]->orders  ?? 0),
            ];
        }

        // ── Revenus par mois (12 derniers mois) ──
        $revenueByMonth = Order::whereIn('status', ['delivered', 'confirmed', 'preparing', 'shipped'])
            ->where('created_at', '>=', $now->copy()->subMonths(11)->startOfMonth())
            ->select(
                DB::raw("DATE_FORMAT(created_at, '%Y-%m') as month"),
                DB::raw("SUM(total) as revenue"),
                DB::raw("COUNT(*) as orders")
            )
            ->groupBy('month')
            ->orderBy('month')
            ->get();

        $monthMap = $revenueByMonth->keyBy('month');
        $months   = [];
        for ($i = 11; $i >= 0; $i--) {
            $m        = $now->copy()->subMonths($i)->format('Y-m');
            $months[] = [
                'month'   => $m,
                'label'   => $now->copy()->subMonths($i)->locale('fr')->isoFormat('MMM YY'),
                'revenue' => (int) ($monthMap[$m]->revenue ?? 0),
                'orders'  => (int) ($monthMap[$m]->orders  ?? 0),
            ];
        }

        // ── Commandes par statut ──
        $ordersByStatus = Order::select('status', DB::raw('COUNT(*) as count'))
            ->groupBy('status')
            ->get()
            ->mapWithKeys(fn($r) => [$r->status => $r->count]);

        // ── Top 5 produits ──
        $topProducts = DB::table('order_items')
            ->join('products', 'order_items.product_id', '=', 'products.id')
            ->join('orders', 'order_items.order_id', '=', 'orders.id')
            ->whereIn('orders.status', ['delivered', 'confirmed', 'preparing', 'shipped'])
            ->select(
                'products.name',
                DB::raw('SUM(order_items.quantity) as quantity'),
                DB::raw('SUM(order_items.quantity * order_items.unit_price) as revenue')
            )
            ->groupBy('products.id', 'products.name')
            ->orderByDesc('revenue')
            ->limit(10)
            ->get();

        // ── 5 dernières commandes ──
        $recentOrders = Order::with('user')
            ->latest()
            ->limit(5)
            ->get()
            ->map(fn($o) => [
                'number'     => $o->number,
                'status'     => $o->status,
                'total'      => $o->total,
                'client'     => $o->user ? trim("{$o->user->first_name} {$o->user->last_name}") ?: $o->user->email : '—',
                'created_at' => $o->created_at->toDateTimeString(),
            ]);

        // ── Évolution clients par mois ──
        $clientsByMonth = User::where('role', 'client')
            ->where('created_at', '>=', $now->copy()->subMonths(11)->startOfMonth())
            ->select(
                DB::raw("DATE_FORMAT(created_at, '%Y-%m') as month"),
                DB::raw("COUNT(*) as count")
            )
            ->groupBy('month')
            ->get()
            ->keyBy('month');

        $clientsMonthly = [];
        for ($i = 11; $i >= 0; $i--) {
            $m = $now->copy()->subMonths($i)->format('Y-m');
            $clientsMonthly[] = [
                'month' => $m,
                'label' => $now->copy()->subMonths($i)->locale('fr')->isoFormat('MMM YY'),
                'count' => (int) ($clientsByMonth[$m]->count ?? 0),
            ];
        }

        return response()->json([
            'kpis' => [
                'revenue_total'   => (int) $revenueTotal,
                'revenue_month'   => (int) $revenueMonth,
                'revenue_prev'    => (int) $revenuePrev,
                'revenue_growth'  => $revenuePrev > 0 ? round((($revenueMonth - $revenuePrev) / $revenuePrev) * 100, 1) : null,
                'tva_month'       => (int) round($revenueMonth * self::TVA_RATE),
                'tva_total'       => (int) round($revenueTotal * self::TVA_RATE),
                'ht_month'        => (int) round($revenueMonth / (1 + self::TVA_RATE)),
                'ht_total'        => (int) round($revenueTotal / (1 + self::TVA_RATE)),
                'orders_total'    => (int) $ordersTotal,
                'orders_month'    => (int) $ordersMonth,
                'orders_prev'     => (int) $ordersPrev,
                'orders_growth'   => $ordersPrev > 0 ? round((($ordersMonth - $ordersPrev) / $ordersPrev) * 100, 1) : null,
                'clients_total'   => (int) $clientsTotal,
                'clients_month'   => (int) $clientsMonth,
                'clients_prev'    => (int) $clientsPrev,
                'avg_order_value' => (int) $avgOrder,
                'stock_value'     => (int) $stockValue,
                'products_active' => Product::where('is_active', true)->whereNull('deleted_at')->count(),
            ],
            'revenue_by_day'    => $days,
            'revenue_by_month'  => $months,
            'clients_by_month'  => $clientsMonthly,
            'orders_by_status'  => $ordersByStatus,
            'top_products'      => $topProducts,
            'recent_orders'     => $recentOrders,
            'generated_at'      => $now->toDateTimeString(),
        ]);
    }
}
