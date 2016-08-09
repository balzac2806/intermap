<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Http\Requests;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Response;
use Illuminate\Support\Facades\View,
    \App\Place,
    Illuminate\Support\Facades\Input,
    Illuminate\Support\Facades\Validator,
    App\Opinion,
    App\User;

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
        $rates = Place::getOverallRate();

        foreach ($data as $key => $val) {
            foreach ($rates as $k => $v) {
                if ($val->id == $v->object_id) {
                    $data[$key]->count = $rates[$k]->count;
                    $data[$key]->rate = round(($rates[$k]->answer_overall / $rates[$k]->answer_count), 2);
                }
            }
        }

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
        
        $rate = Place::getOverallRateById($id);
        $place['count'] = $rate[0]->count;
        $place['rate'] = round(($rate[0]->answer_overall / $rate[0]->answer_count), 2);
        
        $opinions = Opinion::where('object_id', '=', $id)->get()->toArray();

        $users = User::select('id', 'email')->get()->toArray();
        $users = array_column($users, 'email', 'id');

        $success = true;

        return Response::json(compact('success', 'place', 'opinions', 'users'));
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
