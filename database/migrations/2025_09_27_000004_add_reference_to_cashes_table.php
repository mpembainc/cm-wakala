<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('cashes', function (Blueprint $table) {
            $table->string('reference', 100)->nullable()->after('remark');
        });
    }

    public function down(): void
    {
        Schema::table('cashes', function (Blueprint $table) {
            $table->dropColumn('reference');
        });
    }
};
