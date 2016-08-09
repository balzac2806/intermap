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
    
    public static function getOverallRate() {
        $rates = DB::table('poll_answers')
                ->select(DB::raw('count(distinct(poll_id)) as count, sum(answer::int) as answer_overall, count(answer) as answer_count, object_id'))
                ->groupBy('object_id')
                ->where('answer', '>', '0')
                ->where('answer_id', '>', '3')
                ->get();
        
        return $rates;
    }
    
    public static function getOverallRateById($placeId) {
        $rates = DB::table('poll_answers')
                ->select(DB::raw('count(distinct(poll_id)) as count, sum(answer::int) as answer_overall, count(answer) as answer_count, object_id'))
                ->groupBy('object_id')
                ->where('answer', '>', '0')
                ->where('object_id', '=', $placeId)
                ->where('answer_id', '>', '3')
                ->get();
        
        return $rates;
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
