<?php

namespace App;

use Illuminate\Foundation\Auth\User as Authenticatable,
    \Illuminate\Support\Facades\DB;

class User extends Authenticatable {

    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'name', 'email', 'password',
    ];

    /**
     * The attributes that should be hidden for arrays.
     *
     * @var array
     */
    protected $hidden = [
        'password', 'remember_token',
    ];

    const ROLE_ADMIN = 'admin';
    const ROLE_USER = 'user';

    public static function getAll() {
        $users = DB::table('users')
                ->where('role', '!=', User::ROLE_ADMIN)
                ->get();
        return $users;
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
    public static function createOrUpdate($input, $id = null)
    {
        $user = !empty($id) ? User::findById($id) : new User;
        $user->fill($input);
        
        if (!empty($input['password'])) {
            $user->password = bcrypt($input['password']);
        }
        $user->save();

        return $user;
    }

}
