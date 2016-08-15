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
    App\PollAnswer,
    App\Course,
    App\CoursesPlace;

class PlaceController extends Controller {

    public function create() {
        $input = Input::all();

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

        $data = $array = json_decode(json_encode($data), true);

        if (!empty($input['sort'])) {

            $sortArray = array();

            foreach ($data as $place) {
                foreach ($place as $key => $value) {
                    if (!isset($sortArray[$key])) {
                        $sortArray[$key] = array();
                    }
                    $sortArray[$key][] = $value;
                }
            }

            $sort = ($input['sort'] == 'name') ? SORT_ASC : SORT_DESC;
            $orderby = $input['sort'];

            array_multisort($sortArray[$orderby], $sort, $data);
        }

        return Response::json(compact('success', 'data'));
    }

    public function store($id = null) {
        $input = Input::all();
        $valid = new PlaceChangeRequest($input, $id);

        if ($valid->fails())
            return $valid->failResponse();

        $place = Place::createOrUpdate($input, $id);

        CoursesPlace::where('place_id', $id)->delete();
        if (!empty($input['courses'])) {
            foreach ($input['courses'] as $course) {
                CoursesPlace::insert(array(
                    'place_id' => $id,
                    'course_id' => $course,
                    'created_at' => 'now()',
                    'updated_at' => 'now()'
                ));
            }
        }
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
        $courses = CoursesPlace::select('course_id')
                ->where('place_id', $id)
                ->get()
                ->toArray();
        
        $place['courses'] = array_column($courses, 'course_id');

        $opinions = Opinion::where('object_id', '=', $id)->get()->toArray();

        $users = User::select('id', 'email')->get()->toArray();
        $users = array_column($users, 'email', 'id');
        $courses = Course::select('id', 'name')->get()->toArray();

        $success = true;

        return Response::json(compact('success', 'place', 'opinions', 'users', 'courses'));
    }

    public function courses() {
        $courses = Course::select('id', 'name')->get()->toArray();

        $success = true;

        return Response::json(compact('success', 'courses'));
    }

    public function searchCourses() {
        $input = Input::all();
        $search = '';
        if (!empty($input['search'])) {
            $search = $input['search'];
        }
        $search = '%' . $search . '%';
        $courses = Course::select('id', 'name')
                ->where('name', 'like', $search)
                ->get()
                ->toArray();

        $success = true;
        return Response::json(compact('success', 'courses'));
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

    public function geolocations() {
        $success = true;
        $data = Place::select('name', 'lat', 'lng')
                ->whereNotNull('lat')
                ->whereNotNull('lng')
                ->orderBy('name')
                ->get();
        foreach ($data as $key => $val) {
            $data[$key]['radius'] = 40;
        }

        return Response::json(compact('success', 'data'));
    }

    public function geolocationsPlaces() {
        $success = true;
        $data = Place::select('name', 'lat', 'lng')
                ->orderBy('name')
                ->get();

        return Response::json(compact('success', 'data'));
    }

    public function rank() {
        $success = true;
        $data = Place::getRank();

        return Response::json(compact('success', 'data'));
    }

    public function getCoordinates() {
        $data = Place::select('id', 'name', 'address', 'city')
                ->whereNull('lat')
                ->orWhereNull('lng')
                ->orderBy('name')
                ->get();

        foreach ($data as &$data) {

            $params = [
                'address' => $data['address'] . ', ' . $data['city']
            ];

            $curl = curl_init(sprintf('%s?%s', 'https://maps.googleapis.com/maps/api/geocode/json', http_build_query($params)));
            curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
            $curlResponse = curl_exec($curl);

            if (!$curlResponse) {
                $info = curl_getinfo($curl);
                curl_close($info);
                throw new CurlNotConnectedException;
            }
            curl_close($curl);
            $response = json_decode($curlResponse);
            if (isset($response->status) && $response->status == 'ERROR') {
                throw new CurlErrorException('error occured: ' . $response->response->errormessage);
            }

            if (!empty($response->results[0])) {
                $coordinates = (array) $response->results[0]->geometry->location;
            }

            if (!empty($coordinates)) {
                Place::where('id', $data['id'])
                        ->update(array(
                            'lat' => $coordinates['lat'],
                            'lng' => $coordinates['lng']
                ));
            }
        }

        return Response::json(compact('success', 'data'));
    }

}
