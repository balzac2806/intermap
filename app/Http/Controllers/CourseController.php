<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Http\Requests;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Response;
use Illuminate\Support\Facades\View,
    \App\Course,
    Illuminate\Support\Facades\Input,
    Illuminate\Support\Facades\Validator,
    App\PollAnswer;

class CourseController extends Controller {

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
        $data = Course::getAll();

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

        $course = Course::createOrUpdate(Input::all(), $id);

        $success = !empty($course);

        return Response::json(compact('success', 'course'));
    }

    /**
     * Wyświetla użytkownika
     *
     * @param  int $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function show($id) {
        $course = Course::findById($id);

        if (empty($course)) {
            $error = 'Upss, wystąpił błąd! Spróbuj później.';
            return Response::json(compact('success', 'error'));
        }

        $success = true;

        return Response::json(compact('success', 'course'));
    }

    public function destroy($id) {
        $course = Course::findById($id);

        $success = false;

        if (empty($course)) {
            $error = 'Upss, wystąpił błąd! Spróbuj później.';
            return Response::json(compact('success', 'error'));
        }

        $course->delete();

        $success = true;

        return Response::json(compact('success', 'course'));
    }

}
