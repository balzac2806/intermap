<?php

namespace App\Http\Controllers;

use App\Http\Requests,
    Illuminate\Support\Facades\Response,
    \App\Place,
    Illuminate\Support\Facades\Input,
    Illuminate\Support\Facades\Validator,
    App\Opinion,
    App\User,
    App\Http\Requests\PlaceChangeRequest,
    App\PollAnswer;

class PlaceController extends Controller {

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
            if (empty($data[$key]->count) && empty($data[$key]->rate)) {
                $data[$key]->count = 0;
                $data[$key]->rate = '?';
            }
        }

        return Response::json(compact('success', 'data'));
    }

    public function store($id = null) {
        $valid = new PlaceChangeRequest(Input::all(), $id);

        if ($valid->fails())
            return $valid->failResponse();

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

        $place['count'] = 0;
        $place['rate'] = '?';
        if (!empty($rate)) {
            $place['count'] = $rate[0]->count;
            $place['rate'] = round(($rate[0]->answer_overall / $rate[0]->answer_count), 2);
        }

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
        
        PollAnswer::where('object_id', $id)->delete();
        Opinion::where('object_id', $id)->delete();

        $success = true;

        return Response::json(compact('success'));
    }

}
