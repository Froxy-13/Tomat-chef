<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->unsignedInteger('loyalty_points')->default(0)->after('role');
        });

        Schema::table('orders', function (Blueprint $table) {
            $table->unsignedInteger('loyalty_points_earned')->nullable()->after('total');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn('loyalty_points');
        });
        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn('loyalty_points_earned');
        });
    }
};
