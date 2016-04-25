<?php

use Illuminate\Database\Seeder;
use App\User;
use Illuminate\Support\Facades\Hash;

class UsersTableSeeder extends Seeder {

    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run() {
        User::create([
            'name' => 'Daniel Golubiewski',
            'email' => 'superadmin@intermap.pl',
            'password' => Hash::make('intermap2016$..'),
            'role' => 'admin',
        ]);
    }

}
