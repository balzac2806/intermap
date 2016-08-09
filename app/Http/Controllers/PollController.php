<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Http\Requests;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Response;
use Illuminate\Support\Facades\View,
    \App\Poll,
    Illuminate\Support\Facades\Input,
    Illuminate\Support\Facades\Validator,
    App\PollAnswer;

class PollController extends Controller {

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
                    'type' => 'required',
                    'scale' => 'required',
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
                    'type' => 'required',
                    'scale' => 'required',
        ]);
    }

    public function create() {
        $success = true;
        $data = Poll::getAll();
        $statuses = PollAnswer::$statuses;
        $sex = Poll::$sex_values;
        $voivodeships = Poll::$voivodeships;

        return Response::json(compact('success', 'data', 'statuses', 'sex', 'voivodeships'));
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

        $question = Poll::createOrUpdate(Input::all(), $id);

        $success = !empty($question);

        return Response::json(compact('success', 'question'));
    }

    /**
     * Wyświetla użytkownika
     *
     * @param  int $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function show($id) {
        $question = Poll::findById($id);

        if (empty($question)) {
            $error = 'Upss, wystąpił błąd! Spróbuj później.';
            return Response::json(compact('success', 'error'));
        }

        $success = true;

        return Response::json(compact('success', 'question'));
    }

    public function destroy($id) {
        $question = Poll::findById($id);

        $success = false;

        if (empty($question)) {
            $error = 'Upss, wystąpił błąd! Spróbuj później.';
            return Response::json(compact('success', 'error'));
        }

        $question->delete();

        $success = true;

        return Response::json(compact('success'));
    }

}
