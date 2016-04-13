<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Http\Requests;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Response;
use Illuminate\Support\Facades\View;

class UserController extends Controller {

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
