<?php

namespace App;

use Illuminate\Foundation\Auth\User as Authenticatable,
    \Illuminate\Support\Facades\DB;

class PollAnswer extends Authenticatable {

    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'answer',
        'poll_id',
        'answer_id',
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
    
    const STATUS_CHOOSE = 0;
    const STATUS_INACTIVE = 5;
    const STATUS_ACTIVE = 10;
    
    public static $statuses = [
        self::STATUS_CHOOSE => [
            'id' => '',
            'name' => '-- Wybierz -- ',
        ],
        self::STATUS_INACTIVE => [
            'id' => self::STATUS_INACTIVE,
            'name' => 'Niekatywna',
        ],
        self::STATUS_ACTIVE => [
            'id' => self::STATUS_ACTIVE,
            'name' => 'Aktywna',
        ]
    ];

    public static function getAll() {
        $answers = DB::table('poll_answers')
                ->select('poll_id', 'users.email as pollster_id', 'places.name as object_id', 'status', 'poll_answers.created_at', 'poll_answers.updated_at')
                ->leftJoin('users', 'users.id', '=', 'poll_answers.pollster_id')
                ->leftJoin('places', 'places.id', '=', 'poll_answers.object_id')
                ->distinct()
                ->orderBy('poll_id', 'desc')
                ->get();
        return $answers;
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
        $answer = !empty($id) ? PollAnswer::findById($id) : new PollAnswer;
        $answer->fill($input);

        $answer->save();

        return $answer;
    }

}
