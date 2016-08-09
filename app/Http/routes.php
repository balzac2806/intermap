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

// Użytkownicy 
Route::post('api/user', 'UserController@store');
Route::put('api/user/{id}', 'UserController@store');
Route::get('api/user', 'UserController@create');
Route::get('api/user/{id}', 'UserController@show');
Route::delete('api/user/{id}', 'UserController@destroy');

// Uczelnie 
Route::post('api/place', 'PlaceController@store');
Route::put('api/place/{id}', 'PlaceController@store');
Route::get('api/place', 'PlaceController@create');
Route::get('api/place/{id}', 'PlaceController@show');
Route::delete('api/place/{id}', 'PlaceController@destroy');

// Pytania 
Route::post('api/poll', 'PollController@store');
Route::put('api/poll/{id}', 'PollController@store');
Route::get('api/poll', 'PollController@create');
Route::get('api/poll/{id}', 'PollController@show');
Route::delete('api/poll/{id}', 'PollController@destroy');

// Opinie 
Route::post('api/opinion', 'OpinionController@store');
Route::put('api/opinion/{id}', 'OpinionController@store');
Route::get('api/opinion', 'OpinionController@create');
Route::get('api/opinion/{id}', 'OpinionController@show');
Route::delete('api/opinion/{id}', 'OpinionController@destroy');

// Ankiety - Odpowiedzi 
Route::post('api/answers', 'PollAnswerController@store');
Route::put('api/answers/{pollId}', 'PollAnswerController@store');
Route::get('api/answers', 'PollAnswerController@create');
Route::get('api/answers/{id}', 'PollAnswerController@show');
Route::delete('api/answers/{id}', 'PollAnswerController@destroy');

// Ankieterzy
Route::post('api/pollsters', 'PollsterController@store');
Route::put('api/pollsters/{id}', 'PollsterController@store');
Route::get('api/pollsters', 'PollsterController@create');
Route::get('api/pollsters/{id}', 'PollsterController@show');
Route::delete('api/pollsters/{id}', 'PollsterController@destroy');