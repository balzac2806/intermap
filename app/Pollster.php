<?php

namespace App;

use Illuminate\Foundation\Auth\User as Authenticatable,
    \Illuminate\Support\Facades\DB;

class Pollster extends Authenticatable {

    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'email',
    ];

    /**
     * The attributes that should be hidden for arrays.
     *
     * @var array
     */
    protected $hidden = [
    ];

    public static function getAll() {
        $pollsters = DB::table('pollsters')
                ->get();
        return $pollsters;
    }

    /**
     * Zwraca użytkownika po kluczu id.
     * @param int $id
     * @return \User|static|null
     */
    public static function findById($id) {
        $query = self::where('id', '=', $id);

        return $query->first();
    }

    /**
     * Tworzy lub edytuje użytkownika
     * @param array $input
     * @param int $id
     * @return User
     */
    public static function createOrUpdate($input, $id = null) {
        $pollster = !empty($id) ? Pollster::findById($id) : new Pollster;
        $pollster->fill($input);

        $pollster->save();

        return $pollster;
    }

}
