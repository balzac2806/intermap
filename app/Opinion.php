<?php

namespace App;

use Illuminate\Foundation\Auth\User as Authenticatable,
    \Illuminate\Support\Facades\DB;

class Opinion extends Authenticatable {

    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'opinion',
        'object_id',
        'pollster_id',
        'status',
    ];

    /**
     * The attributes that should be hidden for arrays.
     *
     * @var array
     */
    protected $hidden = [
    ];

    public static function getAll() {
        $opinions = DB::table('opinions')
                ->select('opinions.id', 'users.email as pollster_id', 'places.name as object_id', 'status', 'opinions.created_at', 'opinions.updated_at', 'opinions.opinion')
                ->leftJoin('users', 'users.id', '=', 'opinions.pollster_id')
                ->leftJoin('places', 'places.id', '=', 'opinions.object_id')
                ->orderBy('opinions.id', 'desc')
                ->get();
        return $opinions;
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
        $opinion = !empty($id) ? Opinion::findById($id) : new Opinion;
        $opinion->fill($input);

        $opinion->save();

        return $opinion;
    }

}
