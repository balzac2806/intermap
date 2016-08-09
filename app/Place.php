<?php

namespace App;

use Illuminate\Foundation\Auth\User as Authenticatable,
    \Illuminate\Support\Facades\DB;

class Place extends Authenticatable {

    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'name',
        'description',
        'phone',
        'address',
        'post_code',
        'city',
        'site',
    ];

    /**
     * The attributes that should be hidden for arrays.
     *
     * @var array
     */
    protected $hidden = [
    ];

    public static function getAll() {
        $places = DB::table('places')
                ->get();
        return $places;
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
        $place = !empty($id) ? Place::findById($id) : new Place;
        $place->fill($input);

        $place->save();

        return $place;
    }

}
