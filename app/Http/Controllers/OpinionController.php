<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Http\Requests;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Response;
use Illuminate\Support\Facades\View,
    App\Opinion,
    Illuminate\Support\Facades\Input,
    Illuminate\Support\Facades\Validator;

class OpinionController extends Controller {

    /**
     * Get a validator for an incoming user create request.
     *
     * @param  array  $data
     * @return \Illuminate\Contracts\Validation\Validator
     */
    protected function validator(array $data) {
        return Validator::make($data, [
                    'opinion' => 'required|max:255',
                    'object_id' => 'required',
                    'pollster_id' => 'required',
                    'status' => 'required',
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
                    'opinion' => 'required|max:255',
                    'object_id' => 'required',
                    'pollster_id' => 'required',
                    'status' => 'required',
        ]);
    }

    public function create() {
        $success = true;
        $data = Opinion::getAll();

        return Response::json(compact('success', 'data'));
    }

    public function store($id = null) {
        $data = Input::all();
        
        $auth= Auth::check();
        if (!empty($auth)) {
            $user['id'] = $data['user_id'];
        }
        
        if ($id) {
            $validator = $this->validatorUpdate($data);
        } else {
            $data['pollster_id'] = $user['id'];
            $data['status'] = 10;
            $validator = $this->validator($data);
        }

        $success = false;

        if ($validator->fails()) {
            $error = $validator->errors();
            return Response::json(compact('success', 'error'));
        }

        $opinion = Opinion::createOrUpdate($data, $id);

        $success = !empty($opinion);

        return Response::json(compact('success', 'opinion'));
    }

    /**
     * Wyświetla użytkownika
     *
     * @param  int $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function show($id) {
        $opinion = Opinion::findById($id);

        if (empty($opinion)) {
            $error = 'Upss, wystąpił błąd! Spróbuj później.';
            return Response::json(compact('success', 'error'));
        }

        $success = true;

        return Response::json(compact('success', 'opinion'));
    }

    public function destroy($id) {
        $opinion = Opinion::findById($id);

        $success = false;

        if (empty($opinion)) {
            $error = 'Upss, wystąpił błąd! Spróbuj później.';
            return Response::json(compact('success', 'error'));
        }

        $opinion->delete();

        $success = true;

        return Response::json(compact('success'));
    }

}
