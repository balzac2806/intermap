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
        'lat',
        'lng'
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
                ->orderBy('name')
                ->get();
        return $places;
    }

    public static function getRank() {
        $places = DB::table('places')
                ->select(DB::raw('places.id, places.name, count(distinct(poll_id)) as count, round(avg(answer::int),2) as rate, sum(answer::int), count(answer::int) as cnt'))
                ->leftJoin('poll_answers', 'poll_answers.object_id', '=', 'places.id')
                ->leftJoin('polls', 'polls.id', '=', 'poll_answers.answer_id')
                ->where('polls.type', '=', 'score')
                ->groupBy('places.name')
                ->groupBy('places.id')
                ->orderBy('rate', 'desc')
                ->orderBy('count', 'desc')
                ->orderBy('places.name', 'asc')
                ->get();
        
        return $places;
    }

    public static function getOverallRate() {
        $rates = DB::table('poll_answers')
                ->select(DB::raw('count(distinct(poll_id)) as count, sum(answer::int) as answer_overall, count(answer) as answer_count, object_id'))
                ->leftJoin('polls', 'polls.id', '=', 'poll_answers.answer_id')
                ->groupBy('object_id')
                ->where('polls.type', '=', 'score')
                ->get();

        return $rates;
    }

    public static function getOverallRateById($placeId) {
        $rates = DB::table('poll_answers')
                ->select(DB::raw('count(distinct(poll_id)) as count, sum(answer::int) as answer_overall, count(answer) as answer_count, object_id'))
                ->leftJoin('polls', 'polls.id', '=', 'poll_answers.answer_id')
                ->groupBy('object_id')
                ->where('polls.type', '=', 'score')
                ->where('answer', '>', '0')
                ->where('object_id', '=', $placeId)
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
