<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Http\Requests;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Response;
use Illuminate\Support\Facades\View,
    \App\Pollster,
    Illuminate\Support\Facades\Input,
    Illuminate\Support\Facades\Validator,
    App\PollAnswer;

class PollsterController extends Controller {

    /**
     * Get a validator for an incoming user create request.
     *
     * @param  array  $data
     * @return \Illuminate\Contracts\Validation\Validator
     */
    protected function validator(array $data) {
        return Validator::make($data, [
                    'email' => 'required'
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
                    'email' => 'required'
        ]);
    }

    public function create() {
        $success = true;
        $data = Pollster::getAll();

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

        $pollster = Pollster::createOrUpdate(Input::all(), $id);

        $success = !empty($pollster);

        return Response::json(compact('success', 'pollster'));
    }

    /**
     * Wyświetla użytkownika
     *
     * @param  int $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function show($id) {
        $pollster = Pollster::findById($id);

        if (empty($pollster)) {
            $error = 'Upss, wystąpił błąd! Spróbuj później.';
            return Response::json(compact('success', 'error'));
        }

        $success = true;

        return Response::json(compact('success', 'pollster'));
    }

    public function destroy($id) {
        $pollster = Pollster::findById($id);

        $success = false;

        if (empty($pollster)) {
            $error = 'Upss, wystąpił błąd! Spróbuj później.';
            return Response::json(compact('success', 'error'));
        }

        $pollster->delete();

        PollAnswer::where('pollster_id', $id)->delete();
        
        $success = true;

        return Response::json(compact('success', 'pollster'));
    }

}
