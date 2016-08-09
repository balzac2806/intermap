<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Http\Requests;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Response;
use Illuminate\Support\Facades\View,
    \App\Place,
    Illuminate\Support\Facades\Input,
    Illuminate\Support\Facades\Validator;

class PlaceController extends Controller {

    /**
     * Get a validator for an incoming user create request.
     *
     * @param  array  $data
     * @return \Illuminate\Contracts\Validation\Validator
     */
    protected function validator(array $data) {
        return Validator::make($data, [
                    'name' => 'required',
                    'description' => 'required|max:255',
                    'phone' => 'required',
                    'address' => 'required',
                    'post_code' => 'required',
                    'city' => 'required',
                    'site' => 'required',
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
                    'description' => 'required|max:255',
                    'phone' => 'required',
                    'address' => 'required',
                    'post_code' => 'required',
                    'city' => 'required',
                    'site' => 'required',
        ]);
    }


    public function create() {
        $success = true;
        $data = Place::getAll();

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

        $place = Place::createOrUpdate(Input::all(), $id);

        $success = !empty($place);

        return Response::json(compact('success', 'place'));
    }

    /**
     * Wyświetla użytkownika
     *
     * @param  int $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function show($id) {
        $place = Place::findById($id);

        if (empty($place)) {
            $error = 'Upss, wystąpił błąd! Spróbuj później.';
            return Response::json(compact('success', 'error'));
        }

        $success = true;

        return Response::json(compact('success', 'place'));
    }

    public function destroy($id) {
        $place = Place::findById($id);

        $success = false;

        if (empty($place)) {
            $error = 'Upss, wystąpił błąd! Spróbuj później.';
            return Response::json(compact('success', 'error'));
        }

        $place->delete();

        $success = true;

        return Response::json(compact('success'));
    }

}
