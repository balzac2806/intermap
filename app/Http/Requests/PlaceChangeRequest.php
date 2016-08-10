<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest,
    App\Services\ValidatorExtension;

class PlaceChangeRequest extends FormRequest {

    /**
     * Zasady walidacji danych
     * @var array
     */
    protected $rules = [
        'name' => 'required',
        'description' => 'required|max:255',
        'phone' => 'required',
        'address' => 'required',
        'post_code' => 'required|postCode',
        'city' => 'required',
        'site' => 'required',
    ];

    protected function changeInput(array $input, $id = null) {
        return $input;
    }

    /**
     * Customowe rozszerzenia walidatora
     */
    protected function validatorExtensions($id = null) {
        $input = $this->getInput();
        ValidatorExtension::postCode($input);
    }

}
