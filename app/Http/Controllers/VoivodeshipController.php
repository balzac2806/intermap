<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Http\Requests;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Response;
use Illuminate\Support\Facades\View,
    App\Voivodeship,
    Illuminate\Support\Facades\Input,
    Illuminate\Support\Facades\Validator,
    App\PollAnswer;

class VoivodeshipController extends Controller {

    /**
     * Get a validator for an incoming user create request.
     *
     * @param  array  $data
     * @return \Illuminate\Contracts\Validation\Validator
     */
    protected function validator(array $data) {
        return Validator::make($data, [
                    'name' => 'required'
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
                    'name' => 'required'
        ]);
    }

    public function create() {
        $success = true;
        $data = Voivodeship::getAll();

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

        $voivodeship = Voivodeship::createOrUpdate(Input::all(), $id);

        $success = !empty($voivodeship);

        return Response::json(compact('success', 'voivodeship'));
    }

    /**
     * Wyświetla województwo
     *
     * @param  int $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function show($id) {
        $voivodeship = Voivodeship::findById($id);

        if (empty($voivodeship)) {
            $error = 'Upss, wystąpił błąd! Spróbuj później.';
            return Response::json(compact('success', 'error'));
        }

        $success = true;

        return Response::json(compact('success', 'voivodeship'));
    }

    public function destroy($id) {
        $voivodeship = Voivodeship::findById($id);

        $success = false;

        if (empty($voivodeship)) {
            $error = 'Upss, wystąpił błąd! Spróbuj później.';
            return Response::json(compact('success', 'error'));
        }

        $voivodeship->delete();

        $success = true;

        return Response::json(compact('success', 'voivodeship'));
    }

}
