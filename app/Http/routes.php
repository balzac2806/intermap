<?php

/*
  |--------------------------------------------------------------------------
  | Application Routes
  |--------------------------------------------------------------------------
  |
  | Here is where you can register all of the routes for an application.
  | It's a breeze. Simply tell Laravel the URIs it should respond to
  | and give it the controller to call when that URI is requested.
  |
 */
$this->front = 'front/';

Route::get('/', function () {
    return view($this->front . 'master');
});

Route::post('auth', 'UserController@checkAuth');

Route::post('register', 'AuthController@create');

Route::post('api/user', 'UserController@store');
Route::put('api/user/{id}', 'UserController@store');
Route::get('api/user', 'UserController@create');
Route::get('api/user/{id}', 'UserController@show');
Route::delete('api/user/{id}', 'UserController@destroy');


Route::resource('user', 'UserController');
