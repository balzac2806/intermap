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
    App\CoursesPlace,
    App\Voivodeship,
    App\VoivodeshipPlace,
    DOMDocument,
    DomXPath,
    Ixudra\Curl\Facades\Curl;

class PlaceController extends Controller {

    public function create() {
        $input = Input::all();
        if (!empty($input['find'])) {
            $find = json_decode($input['find'], true);
        }
        $success = true;
        $data = Place::select('*');
        if (!empty($find)) {
            if (!empty($find['name'])) {
                $data = $data->whereRaw('LOWER(name) LIKE ?', ['%' . strtolower($find['name']) . '%']);
            }
            if (!empty($find['voivodeship'])) {
                $data = $data->leftJoin('voivodeship_place', 'voivodeship_place.place_id', '=', 'places.id')
                        ->where('voivodeship_place.voivodeship_id', $find['voivodeship']);
            }
            if (!empty($find['course'])) {
                $data = $data->leftJoin('courses_place', 'courses_place.place_id', '=', 'places.id')
                        ->where('courses_place.course_id', $find['course']);
            }
        }
        $data = $data->get();

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

        if (!empty($input['sort']) && !empty($data)) {

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
        } else {
            $sortArray = array();

            foreach ($data as $place) {
                foreach ($place as $key => $value) {
                    if (!isset($sortArray[$key])) {
                        $sortArray[$key] = array();
                    }
                    $sortArray[$key][] = $value;
                }
            }

            $sort = SORT_ASC;
            $orderby = 'name';

            array_multisort($sortArray[$orderby], $sort, $data);
        }

        return Response::json(compact('success', 'data'));
    }

    public function store($id = null) {
        $input = Input::all();

        // Błąd po aktualizacji http-foundation
//        $valid = new PlaceChangeRequest($input, $id);
//        if ($valid->fails())
//            return $valid->failResponse();

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
        VoivodeshipPlace::where('place_id', $id)->delete();
        if (!empty($input['voivodeship'])) {
            VoivodeshipPlace::insert(array(
                'place_id' => $id,
                'voivodeship_id' => $input['voivodeship'],
                'created_at' => 'now()',
                'updated_at' => 'now()'
            ));
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

        $voivodeships = VoivodeshipPlace::select('voivodeship_id')
                ->where('place_id', $id)
                ->get()
                ->toArray();

        if (!empty($voivodeships[0])) {
            $place['voivodeship'] = $voivodeships[0]['voivodeship_id'];
        } else {
            $place['voivodeship'] = null;
        }

        $opinions = Opinion::where('object_id', '=', $id)->get()->toArray();

        $users = User::select('id', 'email')->get()->toArray();
        $users = array_column($users, 'email', 'id');
        $courses = Course::select('id', 'name')->get()->toArray();
        $courses = array_column($courses, 'name', 'id');
        $voivodeships = Voivodeship::select('id', 'name')->get()->toArray();

        $success = true;

        return Response::json(compact('success', 'place', 'opinions', 'users', 'courses', 'voivodeships'));
    }

    public function courses() {
        $courses = Course::select('id', 'name')->get()->toArray();
        $voivodeships = Voivodeship::select('id', 'name')->get()->toArray();

        $success = true;

        return Response::json(compact('success', 'courses', 'voivodeships'));
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

    public function searchVoivodeships() {
        $input = Input::all();
        $search = '';
        if (!empty($input['search'])) {
            $search = $input['search'];
        }
        $search = '%' . $search . '%';
        $voivodeships = Voivodeship::select('id', 'name')
                ->where('name', 'like', $search)
                ->get()
                ->toArray();

        $success = true;
        return Response::json(compact('success', 'voivodeships'));
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
//                ->whereNull('lat')
//                ->orWhereNull('lng')
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
                            'lat' => !empty($coordinates['lat']) ? $coordinates['lat'] : null,
                            'lng' => !empty($coordinates['lng']) ? $coordinates['lng'] : null,
                ));
            }
        }

        return Response::json(compact('success', 'data'));
    }

    public function getCoursesFromUrl() {
        libxml_use_internal_errors(true);
        $url = 'http://www.perspektywy.pl/portal/index.php?option=com_content&view=article&id=22&Itemid=171';

        $curl = curl_init();
        curl_setopt($curl, CURLOPT_URL, $url);
        curl_setopt($curl, CURLOPT_USERAGENT, 'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:33.0) Gecko/20100101 Firefox/33.0');
        curl_setopt($curl, CURLOPT_RETURNTRANSFER, 1);
        curl_setopt($curl, CURLOPT_COOKIE, TRUE);
        curl_setopt($curl, CURLOPT_COOKIEFILE, 'xpath.txt');
        curl_setopt($curl, CURLOPT_COOKIEJAR, 'xpath.txt');
        curl_setopt($curl, CURLOPT_CONNECTTIMEOUT, 10);
        $str = curl_exec($curl);
        curl_close($curl);

        $dom = new DOMDocument();
        $dom->loadHTML($str);
        $xpath = new DomXPath($dom);

        $courses = $xpath->query("//span[@class='kierunek_poj']");

        for ($i = 0; $i < $courses->length; $i++) {
            $data = [
                'name' => strtolower($courses->item($i)->nodeValue)
            ];
//            Course::createOrUpdate($data);
            var_dump($data['name']);
        }
        $courses = Course::getAll();
        dd($courses);
    }

    public function getPlacesFromUrl() {
        libxml_use_internal_errors(true);
        $url = 'http://www.nauka.gov.pl/uczelnie-publiczne/wykaz-uczelni-publicznych-nadzorowanych-przez-ministra-wlasciwego-ds-szkolnictwa-wyzszego-publiczne-uczelnie-akademickie.html';

        $curl = curl_init();
        curl_setopt($curl, CURLOPT_URL, $url);
        curl_setopt($curl, CURLOPT_USERAGENT, 'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:33.0) Gecko/20100101 Firefox/33.0');
        curl_setopt($curl, CURLOPT_RETURNTRANSFER, 1);
        curl_setopt($curl, CURLOPT_COOKIE, TRUE);
        curl_setopt($curl, CURLOPT_COOKIEFILE, 'xpath.txt');
        curl_setopt($curl, CURLOPT_COOKIEJAR, 'xpath.txt');
        curl_setopt($curl, CURLOPT_CONNECTTIMEOUT, 10);
        $str = curl_exec($curl);
        curl_close($curl);

        $dom = new DOMDocument();
        $dom->loadHTML($str);
        $xpath = new DomXPath($dom);

        $places = $xpath->query("//div[@class='pelnaTresc']/ul/li/a");
        $urls = $xpath->query("//div[@class='pelnaTresc']/ul/li/a/@href");

        $dbPlaces = Place::select('name')->get()->toArray();
        $dbPlaces = array_column($dbPlaces, 'name');

        libxml_use_internal_errors(true);

        $place_search = 'http://wybierzstudia.nauka.gov.pl/pages/search/index';

        $response = Curl::to($place_search)
                ->withData(array(
                    'javax.faces.partial.ajax' => 'true',
                    'javax.faces.source' => 'universityResults',
                    'javax.faces.partial.execute' => 'universityResults',
                    'javax.faces.partial.render' => 'universityResults',
                    'universityResults' => 'universityResults',
                    'universityResults_pagination' => 'true',
                    'universityResults_first' => '0',
                    'universityResults_rows' => '500',
                    'name-panel-form' => 'name-panel-form'
                ))
                ->post();

        $dom = new DOMDocument();
        $dom->loadHTML($response);
        $xpath = new DomXPath($dom);

        $placesGovHrefs = $xpath->query("//td[@class='column2']/a/@href");
        $placesGovTitles = $xpath->query("//td[@class='column2']/a/span");

        for ($i = 0; $i < $places->length; $i++) {
            for ($j = 0; $j < $placesGovTitles->length; $j++) {
                if (!in_array($places->item($i)->nodeValue, $dbPlaces)) {
                    if ($places->item($i)->nodeValue == $placesGovTitles->item($j)->nodeValue) {
                        $query = [
                            'universityId'
                        ];
                        $parts = parse_url($placesGovHrefs->item($j)->nodeValue);
                        parse_str($parts['query'], $query);

                        $placeUrl = 'http://wybierzstudia.nauka.gov.pl/pages/schoolinfo/school-master?fullProfile=false&universityId=' . $query['universityId'];

                        $curl = curl_init();
                        curl_setopt($curl, CURLOPT_URL, $placeUrl);
                        curl_setopt($curl, CURLOPT_USERAGENT, 'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:33.0) Gecko/20100101 Firefox/33.0');
                        curl_setopt($curl, CURLOPT_RETURNTRANSFER, 1);
                        curl_setopt($curl, CURLOPT_COOKIE, TRUE);
                        curl_setopt($curl, CURLOPT_COOKIEFILE, 'xpath.txt');
                        curl_setopt($curl, CURLOPT_COOKIEJAR, 'xpath.txt');
                        curl_setopt($curl, CURLOPT_CONNECTTIMEOUT, 10);
                        $str = curl_exec($curl);
                        curl_close($curl);

                        $dom = new DOMDocument();
                        $dom->loadHTML($str);
                        $xpath = new DomXPath($dom);
                        $placeInfo = $xpath->query('//td[@role="gridcell"]/span');

                        $data = [
                            'name' => $places->item($i)->nodeValue,
                            'site' => $urls->item($i)->nodeValue,
                            'description' => $places->item($i)->nodeValue,
                            'phone' => $placeInfo->item(12)->nodeValue,
                            'address' => $placeInfo->item(8)->nodeValue,
                            'post_code' => $placeInfo->item(10)->nodeValue,
                            'city' => $placeInfo->item(6)->nodeValue,
                            'lat' => '',
                            'lng' => ''
                        ];
                        var_dump($data);
                        Place::createOrUpdate($data);
                    }
                }
            }
        }
        dd('exit');
    }

}
