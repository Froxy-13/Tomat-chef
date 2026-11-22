<?php

namespace Database\Seeders;

use App\Models\DeliveryZone;
use Illuminate\Database\Seeder;

class DeliveryZoneSeeder extends Seeder
{
    public function run(): void
    {
        $zones = [
            ['name' => 'Dakar Centre',  'fee' => 1000, 'is_active' => true],
            ['name' => 'Banlieue',      'fee' => 1500, 'is_active' => true],
            ['name' => 'Régions',       'fee' => 3000, 'is_active' => true],
        ];

        foreach ($zones as $zone) {
            DeliveryZone::create($zone);
        }
    }
}
