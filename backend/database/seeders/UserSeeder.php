<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        User::create([
            'first_name' => 'Fatimata',
            'last_name'  => 'Diallo',
            'email'      => 'diallofatimata353@gmail.com',
            'phone'      => '+221770000001',
            'password'   => Hash::make('Admin@1234'),
            'role'       => 'admin',
            'is_active'  => true,
        ]);

        User::create([
            'first_name' => 'Atta',
            'last_name'  => 'Drama',
            'email'      => 'attadrama053@gmail.com',
            'phone'      => '+221770000002',
            'password'   => Hash::make('Admin@1234'),
            'role'       => 'admin',
            'is_active'  => true,
        ]);

        User::create([
            'first_name' => 'Moussa',
            'last_name'  => 'Diallo',
            'email'      => 'moussa@test.sn',
            'phone'      => '+221770000003',
            'password'   => Hash::make('Client@1234'),
            'role'       => 'client',
            'is_active'  => true,
        ]);

        User::create([
            'first_name' => 'Aminata',
            'last_name'  => 'Ndiaye',
            'email'      => 'aminata@test.sn',
            'phone'      => '+221770000004',
            'password'   => Hash::make('Client@1234'),
            'role'       => 'client',
            'is_active'  => true,
        ]);
    }
}
