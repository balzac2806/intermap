<?php

namespace App\Services;

use Illuminate\Support\Facades\Validator;

class ValidatorExtension {

    /**
     * Rozszerzenie walidatora - sprawdzanie poprawności kodu pocztowego
     * @param array $input
     */
    public static function postCode(array $input) {
        Validator::extend('postCode', function ($attribute, $value, $parameters) use ($input) {
            $postcode = $input[$attribute];
            return preg_match("/^([0-9]{2})(-[0-9]{3})?$/i",$postcode);
        });
    }
    
    /**
     * Rozszerzenie walidatora - sprawdzanie url
     * @param array $input
     */
    public static function checkUrl(array $input) {
        Validator::extend('checkUrl', function ($attribute, $value, $parameters) use ($input) {
            $url = $input[$attribute];
            return preg_match("/^(http|https)?:\/\/.*/i",$url);
        });
    }

}
