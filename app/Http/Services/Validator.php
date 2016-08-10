<?php

namespace App\Http\Services;

use Illuminate\Support\Facades\Validator;

class ValidatorExtension {

    /**
     * Rozszerzenie walidatora - sprawdzanie poprawności kodu pocztowego
     * @param array $input
     */
    public static function postCode(array $input) {
        Validator::extend('postCode', function ($attribute, $value, $parameters) use ($input, $id) {

            dd($inut);
            $check = Beacon::checkUniqueUuid(!empty($input['uuid']) ? $input['uuid'] : null, !empty($input['major']) ? $input['major'] : null, !empty($input['minor']) ? $input['minor'] : null, !empty($id) ? $id : null);
            return empty($check);
        });
    }

}
