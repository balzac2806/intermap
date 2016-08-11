<?php

namespace App;

use Illuminate\Foundation\Auth\User as Authenticatable,
    \Illuminate\Support\Facades\DB;

class Poll extends Authenticatable {

    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'name',
        'description',
        'type',
        'scale',
    ];

    /**
     * The attributes that should be hidden for arrays.
     *
     * @var array
     */
    protected $hidden = [
    ];
    
    const SEX_CHOOSE = 0;
    const SEX_FEMALE = 1;
    const SEX_MALE = 2;
    
    public static $sex_values = [
        self::SEX_CHOOSE => [
            'id' => '',
            'name' => '-- Wybierz -- ',
        ],
        self::SEX_FEMALE => [
            'id' => self::SEX_FEMALE,
            'name' => 'Kobieta',
        ],
        self::SEX_MALE => [
            'id' => self::SEX_MALE,
            'name' => 'Mężczyzna',
        ]
    ];
    
    const STUDENT_CHOOSE = 0;
    const STUDENT_STUDENT = 1;
    const STUDENT_GRADUATE = 2;
    
    public static $student_values = [
        self::STUDENT_CHOOSE => [
            'id' => '',
            'name' => '-- Wybierz -- ',
        ],
        self::STUDENT_STUDENT => [
            'id' => self::STUDENT_STUDENT,
            'name' => 'student',
        ],
        self::STUDENT_GRADUATE => [
            'id' => self::STUDENT_GRADUATE,
            'name' => 'absolwent',
        ]
    ];
    
    const VOIVD_CHOOSE = 0;
    const VOIVD_DOLNOSLASKIE = 1;
    const VOIVD_KUJAWSKO = 2;
    const VOIVD_LUBELSKIE = 3;
    const VOIVD_LUBUSKIE = 4;
    const VOIVD_LODZKIE = 5;
    const VOIVD_MALOPOLSKIE = 6;
    const VOIVD_MAZOWIECKIE = 7;
    const VOIVD_OPOLSKIE = 8;
    const VOIVD_PODKARPACKIE = 9;
    const VOIVD_PODLASKIE = 10;
    const VOIVD_POMORSKIE = 11;
    const VOIVD_SLASKIE = 12;
    const VOIVD_SWIETOKRZYSKIE = 13;
    const VOIVD_WARMINSKO= 14;
    const VOIVD_WIELKOPOLSKIE = 15;
    const VOIVD_ZACHODNIPOMORSKIE = 16;

    public static $voivodeships = [
        self::VOIVD_CHOOSE => [
            'id' => '',
            'name' => '-- Wybierz -- ',
        ],
        self::VOIVD_DOLNOSLASKIE => [
            'id' => self::VOIVD_DOLNOSLASKIE,
            'name' => 'Dolnośląskie',
        ],
        self::VOIVD_KUJAWSKO => [
            'id' => self::VOIVD_KUJAWSKO,
            'name' => 'Kujawsko - Pomorskie',
        ],
        self::VOIVD_LUBELSKIE => [
            'id' => self::VOIVD_LUBELSKIE,
            'name' => 'Lubelskie',
        ],
        self::VOIVD_LUBUSKIE => [
            'id' => self::VOIVD_LUBUSKIE,
            'name' => 'Lubuskie',
        ],
        self::VOIVD_LODZKIE => [
            'id' => self::VOIVD_LODZKIE,
            'name' => 'Łodzkie',
        ],
        self::VOIVD_MALOPOLSKIE => [
            'id' => self::VOIVD_MALOPOLSKIE,
            'name' => 'Małopolskie',
        ],
        self::VOIVD_MAZOWIECKIE => [
            'id' => self::VOIVD_MAZOWIECKIE,
            'name' => 'Mazowieckie',
        ],
        self::VOIVD_OPOLSKIE => [
            'id' => self::VOIVD_OPOLSKIE,
            'name' => 'Opolskie',
        ],
        self::VOIVD_PODKARPACKIE => [
            'id' => self::VOIVD_PODKARPACKIE,
            'name' => 'Podkarpackie',
        ],
        self::VOIVD_PODLASKIE => [
            'id' => self::VOIVD_PODLASKIE,
            'name' => 'Podlaskie',
        ],
        self::VOIVD_POMORSKIE => [
            'id' => self::VOIVD_POMORSKIE,
            'name' => 'Pomorskie',
        ],
        self::VOIVD_SLASKIE => [
            'id' => self::VOIVD_SLASKIE,
            'name' => 'Śląskie',
        ],
        self::VOIVD_SWIETOKRZYSKIE => [
            'id' => self::VOIVD_SWIETOKRZYSKIE,
            'name' => 'Świętokrzyskie',
        ],
        self::VOIVD_WARMINSKO => [
            'id' => self::VOIVD_WARMINSKO,
            'name' => 'Warmińsko - Mazurskie',
        ],
        self::VOIVD_WIELKOPOLSKIE => [
            'id' => self::VOIVD_WIELKOPOLSKIE,
            'name' => 'Wielkopolskie',
        ],
        self::VOIVD_ZACHODNIPOMORSKIE => [
            'id' => self::VOIVD_ZACHODNIPOMORSKIE,
            'name' => 'Zachodniopomorskie',
        ],
    ];
    
    public static function getAll() {
        $questions = DB::table('polls')
                ->get();
        return $questions;
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
        $question = !empty($id) ? Poll::findById($id) : new Poll;
        $question->fill($input);

        $question->save();

        return $question;
    }

}
