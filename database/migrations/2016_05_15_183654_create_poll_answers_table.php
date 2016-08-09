<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreatePollAnswersTable extends Migration {

    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up() {
        Schema::create('poll_answers', function (Blueprint $table) {
            $table->increments('id');
            $table->string('answer');
            $table->integer('poll_id');
            $table->integer('answer_id');
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
        Schema::table('poll_answers', function (Blueprint $table) {
            Schema::drop('poll_answers');
        });
    }

}
