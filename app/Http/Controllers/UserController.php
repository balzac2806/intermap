<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Http\Requests;
use Illuminate\Support\Facades\Auth;

class UserController extends Controller {

    public function checkAuth(Request $request) {
        $credentials = [
            'email' => $request->input('email'),
            'password' => $request->input('password')
        ];

        // If The Credentials Is Valid
        if (!Auth::attempt($credentials)) {
            return response('Podany login lub hasło jest nieprawidłowe !', 200);
        }

        return response(Auth::user(), 201);
    }

    public function create() {
        
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
