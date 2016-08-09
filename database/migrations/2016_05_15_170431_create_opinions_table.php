<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateOpinionsTable extends Migration {

    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up() {
        Schema::create('opinions', function (Blueprint $table) {
            $table->increments('id');
            $table->string('opinion');
            $table->integer('object_id');
            $table->integer('pollster_id');
            $table->integer('status');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down() {
        Schema::table('opinions', function (Blueprint $table) {
            Schema::drop('opinions');
        });
    }

}
