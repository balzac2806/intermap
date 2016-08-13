<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Http\Requests;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Response;
use Illuminate\Support\Facades\View,
    App\PollAnswer,
    Illuminate\Support\Facades\Input,
    Illuminate\Support\Facades\Validator,
    App\Pollster;

class PollAnswerController extends Controller {

    /**
     * Get a validator for an incoming user create request.
     *
     * @param  array  $data
     * @return \Illuminate\Contracts\Validation\Validator
     */
    protected function validator(array $data) {
        return Validator::make($data, [
                    'answers' => 'required|array',
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
                    'answers' => 'required|array',
                    'poll_id' => 'required',
                    'object_id' => 'required',
                    'pollster_id' => 'required',
                    'status' => 'required',
        ]);
    }

    public function create() {
        $success = true;
        $data = PollAnswer::getAll();

        return Response::json(compact('success', 'data'));
    }

    public function store($id = null) {
        $data = Input::all();
        
        $user['id'] = $data['user_id'];
        $user['email'] = $data['user_email'];

        $answers = [];
        $data = [];
        if (!empty(Input::get('answers'))) {
            foreach (Input::get('answers') as $key => $val) {
                $answers[$key] = $val;
            }
        }
        $data['answers'] = $answers;
        $data['pollster_id'] = $user['id'];
        $data['object_id'] = Input::get('object_id');

        if ($id) {
            $pollId = $id;
            $data['poll_id'] = Input::get('poll_id');
            $data['status'] = Input::get('status');
            $pollAnswer = PollAnswer::select('created_at')->where('poll_id', '=', $pollId)->first()->toArray();
            $data['created_at'] = $pollAnswer['created_at'];
            $validator = $this->validatorUpdate($data);
            PollAnswer::where('poll_id', '=', $pollId)->delete();
        } else {
            $pollId = PollAnswer::select('poll_id')->orderBy('poll_id', 'desc')->first();
            if (!empty($pollId)) {
                $pollId = $pollId->toArray()['poll_id'] + 10;
            } else {
                $pollId = 10;
            }
            $data['status'] = 10;
            $validator = $this->validator($data);
        }

        $success = false;

        if ($validator->fails()) {
            $error = $validator->errors();
            return Response::json(compact('success', 'error'));
        }
        foreach ($data['answers'] as $key => $val) {
            $answer = [];
            $answer = [
                'answer' => $val,
                'answer_id' => $key,
                'poll_id' => $pollId,
                'object_id' => $data['object_id'],
                'pollster_id' => $data['pollster_id'],
                'status' => $data['status']
            ];
            $poll = PollAnswer::createOrUpdate($answer);
        }

        $pollster = Pollster::select('id')->where('email', '=', $user['email'])->first();

        if (!empty($pollster)) {
            $pollster = $pollster->toArray();
        } else {
            Pollster::createOrUpdate($user);
        }

        $success = !empty($poll);

        return Response::json(compact('success', 'poll'));
    }

    /**
     * Wyświetla użytkownika
     *
     * @param  int $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function show($pollId) {
        $answers = PollAnswer::where('poll_id', '=', $pollId)->get()->toArray();

        if (empty($answers)) {
            $error = 'Upss, wystąpił błąd! Spróbuj później.';
            return Response::json(compact('success', 'error'));
        }
        $poll = [];
        $poll['poll_id'] = $answers[0]['poll_id'];
        $poll['object_id'] = $answers[0]['object_id'];
        $poll['pollster_id'] = $answers[0]['pollster_id'];
        $poll['status'] = $answers[0]['status'];

        $answer = [];
        foreach ($answers as $key => $val) {
            $answer[$val['answer_id']] = (int) $val['answer'];
        }
        $poll['answers'] = $answer;

        $success = true;

        return Response::json(compact('success', 'poll'));
    }

    public function destroy($pollId) {
        $poll = PollAnswer::where('poll_id', '=', $pollId)->first();

        $success = false;

        if (empty($poll)) {
            $error = 'Upss, wystąpił błąd! Spróbuj później.';
            return Response::json(compact('success', 'error'));
        }

        PollAnswer::where('poll_id', '=', $pollId)->delete();

        $success = true;

        return Response::json(compact('success', 'poll'));
    }

}
