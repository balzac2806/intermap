<?php

namespace App;

use Illuminate\Foundation\Auth\User as Authenticatable,
    \Illuminate\Support\Facades\DB;

class Voivodeship extends Authenticatable {

    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'name',
    ];

    /**
     * The attributes that should be hidden for arrays.
     *
     * @var array
     */
    protected $hidden = [
    ];

    public static function getAll() {
        $voivodeships = DB::table('voivodeships')
                ->get();
        return $voivodeships;
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
     * Tworzy lub edytuje kurs
     * @param array $input
     * @param int $id
     * @return User
     */
    public static function createOrUpdate($input, $id = null) {
        $voivodeship = !empty($id) ? Voivodeship::findById($id) : new Voivodeship;
        $voivodeship->fill($input);

        $voivodeship->save();

        return $voivodeship;
    }

}
