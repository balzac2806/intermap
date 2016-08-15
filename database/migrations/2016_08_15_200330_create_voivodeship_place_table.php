<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateVoivodeshipPlaceTable extends Migration {

    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up() {
        Schema::create('voivodeship_place', function (Blueprint $table) {
            $table->integer('voivodeship_id');
            $table->integer('place_id');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down() {
        Schema::table('voivodeship_place', function (Blueprint $table) {
            Schema::drop('voivodeship_place');
        });
    }

}
