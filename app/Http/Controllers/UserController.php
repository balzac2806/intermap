<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Http\Requests;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Response;
use Illuminate\Support\Facades\View,
    \App\User,
    Illuminate\Support\Facades\Input,
    Illuminate\Support\Facades\Validator;

class UserController extends Controller {

    /**
     * Get a validator for an incoming user create request.
     *
     * @param  array  $data
     * @return \Illuminate\Contracts\Validation\Validator
     */
    protected function validator(array $data) {
        return Validator::make($data, [
                    'name' => 'required',
                    'email' => 'required|email|unique:users,email,NULL',
                    'password' => 'required|min:6',
                    'password_confirmation' => 'required|same:password',
                    'role' => 'required'
        ]);
    }

    /**
     * Get a validator for an incoming user update request.
     *
     * @param  array  $data
     * @return \Illuminate\Contracts\Validation\Validator
     */
    protected function validatorUpdate(array $data) {
        return Validator::make($data, [
                    'name' => 'required',
                    'password' => 'same:password_confirmation',
                    'password_confirmation' => 'same:password',
                    'role' => 'required'
        ]);
    }

    public function checkAuth(Request $request) {
        $credentials = [
            'email' => $request->input('email'),
            'password' => $request->input('password')
        ];

        // If The Credentials Is Valid
        if (!Auth::attempt($credentials)) {
            $success = false;
            $error = 'Podany login lub hasło jest nieprawidłowe !';
            return Response::json(compact('success', 'error'));
        }

        $success = true;
        $data = Auth::user();

        return Response::json(compact('success', 'data'));
    }

    public function create() {
        $success = true;
        $data = User::getAll();

        return Response::json(compact('success', 'data'));
    }

    public function store($id = null) {
        if ($id) {
            $validator = $this->validatorUpdate(Input::all());
        } else {
            $validator = $this->validator(Input::all());
        }

        $success = false;

        if ($validator->fails()) {
            $error = $validator->errors();
            return Response::json(compact('success', 'error'));
        }

        $user = User::createOrUpdate(Input::all(), $id);

        $success = !empty($user);

        return Response::json(compact('success', 'user'));
    }

    /**
     * Wyświetla użytkownika
     *
     * @param  int $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function show($id) {
        $user = User::findById($id);

        if (empty($user)) {
            $error = 'Upss, wystąpił błąd! Spróbuj później.';
            return Response::json(compact('success', 'error'));
        }

        $success = true;

        return Response::json(compact('success', 'user'));
    }

    public function edit($id) {
        
    }

    public function update(Request $request, $id) {
        
    }

    public function destroy($id) {
        $user = User::findById($id);

        $success = false;

        if (empty($user)) {
            $error = 'Upss, wystąpił błąd! Spróbuj później.';
            return Response::json(compact('success', 'error'));
        }

        $user->delete();

        $success = true;

        return Response::json(compact('success'));
    }

}
