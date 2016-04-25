<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Http\Requests;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Response;
use Illuminate\Support\Facades\View,
    Illuminate\Support\Facades\Input,
    Illuminate\Support\Facades\Validator,
    App\User;

class AuthController extends Controller {

    /**
     * Create a new authentication controller instance.
     *
     * @return void
     */
    public function __construct() {
        
    }

    /**
     * Get a validator for an incoming registration request.
     *
     * @param  array  $data
     * @return \Illuminate\Contracts\Validation\Validator
     */
    protected function validator(array $data) {
        return Validator::make($data, [
                    'user_name' => 'required|max:255',
                    'email' => 'required|email|max:255|unique:users',
                    'password' => 'required|confirmed|min:6',
        ]);
    }

    public function create() {
        $input = Input::all();

        $validator = $this->validator($input);

        $success = false;

        if ($validator->fails()) {
            $error = $validator->errors();
            return Response::json(compact('success', 'error'));
        }

        $success = true;

        User::create([
            'name' => $input['user_name'],
            'email' => $input['email'],
            'password' => bcrypt($input['password']),
        ]);

        $data = $input['email'];

        return Response::json(compact('success', 'data'));
    }

    public function store(Request $request) {
        
    }

    public function show($id) {
        
    }

    public function edit($id) {
        
    }

    public function update(Request $request, $id) {
        
    }

    public function destroy($id) {
        
    }

}
