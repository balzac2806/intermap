<?php

namespace Illuminate\Foundation\Http;

use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Http\JsonResponse;
use Illuminate\Routing\Redirector;
use Illuminate\Container\Container;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Http\Exception\HttpResponseException;
use Illuminate\Validation\ValidatesWhenResolvedTrait;
use Illuminate\Contracts\Validation\ValidatesWhenResolved;
use Illuminate\Contracts\Validation\Factory as ValidationFactory;

class FormRequest extends Request implements ValidatesWhenResolved {

    use ValidatesWhenResolvedTrait;

    /**
     * The container instance.
     *
     * @var \Illuminate\Container\Container
     */
    protected $container;

    /**
     * The redirector instance.
     *
     * @var \Illuminate\Routing\Redirector
     */
    protected $redirector;

    /**
     * The URI to redirect to if validation fails.
     *
     * @var string
     */
    protected $redirect;

    /**
     * The route to redirect to if validation fails.
     *
     * @var string
     */
    protected $redirectRoute;

    /**
     * The controller action to redirect to if validation fails.
     *
     * @var string
     */
    protected $redirectAction;

    /**
     * The key to be used for the view error bag.
     *
     * @var string
     */
    protected $errorBag = 'default';

    /**
     * The input keys that should not be flashed on redirect.
     *
     * @var array
     */
    protected $dontFlash = ['password', 'password_confirmation'];

    /**
     * Input po manipulacjach
     * @var array 
     */
    protected $input;

    /**
     * Zasady walidacji
     * @var array
     */
    protected $rules = [];

    /**
     * Laravelowy walidator wykorzystywany przy danym requeście
     * @var \Illuminate\Validation\Validator
     */
    protected $validator;

    /**
     * Walidacja requestu, parametr $id może zmienić zasady walidacji jeżeli są inne dla edycji resourca
     * @param array $input
     * @param null|int $id
     */
    public function __construct(array $input, $id = null) {
        $this->input = $this->changeInput($input, $id);
        $this->validatorExtensions($id);

        if (!empty($id))
            $this->edit($id);
        $this->validator = Validator::make($this->input, $this->rules);
    }

    /**
     * Zwraca używany walidator
     * @return \Illuminate\Validation\Validator
     */
    public function getValidator() {
        return $this->validator;
    }

    /**
     * Ustawia zasady walidacji
     * @param array $rules
     */
    public function setRules(array $rules) {
        $this->rules = $rules;
    }

    /**
     * Zmienia jedną zasadę walidacji
     * @param string $name
     * @param array $rules
     */
    public function setRule($name, array $rules) {
        $this->rules[$name] = $rules;
    }

    /**
     * Zwraca tablicę zasad walidacji
     * @return array
     */
    public function getRules() {
        return $this->rules;
    }

    /**
     * Wyciąga input
     * @return array
     */
    public function getInput() {
        return $this->input;
    }

    /**
     * Ustawia input
     * @param $input
     */
    public function setInput($input) {
        $this->input = $input;
    }

    /**
     * Zwraca request
     * @return array
     */
    public function getRequest() {
        return $this->input;
    }

    /**
     * Zwraca response z wiadomościami walidacji
     * @return \Illuminate\Http\JsonResponse
     */
    public function failResponse() {
        $success = false;
        $error = $this->validator->messages();

        return Response::json(compact('success', 'error'));
    }

    /**
     * Zmiany walidacji podczas edycji
     * @param int $id Id rekordu
     */
    protected function edit($id) {
        //
    }

    /**
     * Wszelkie manipulacje inputem z formularza powinny znaleźć się w tej funkcji.
     * Funkcja odpalana jest na samym początku constructa, zanim utworzony zostanie walidator
     * @param array $input
     * @param int|null $id
     * 
     * @return array
     */
    protected function changeInput(array $input, $id = null) {
        return $input;
    }

    /**
     * Informuje o nieudanej walidacji
     * @return bool
     */
    public function fails() {
        return $this->validator->fails();
    }

    /**
     * Customowe rozszerzenia walidatora
     */
    protected function validatorExtensions() {
        
    }

    /**
     * Get the validator instance for the request.
     *
     * @return \Illuminate\Contracts\Validation\Validator
     */
    protected function getValidatorInstance() {
        $factory = $this->container->make(ValidationFactory::class);

        if (method_exists($this, 'validator')) {
            return $this->container->call([$this, 'validator'], compact('factory'));
        }

        return $factory->make(
                        $this->all(), $this->container->call([$this, 'rules']), $this->messages(), $this->attributes()
        );
    }

    /**
     * Handle a failed validation attempt.
     *
     * @param  \Illuminate\Contracts\Validation\Validator  $validator
     * @return void
     *
     * @throws \Illuminate\Http\Exception\HttpResponseException
     */
    protected function failedValidation(Validator $validator) {
        throw new HttpResponseException($this->response(
                $this->formatErrors($validator)
        ));
    }

    /**
     * Determine if the request passes the authorization check.
     *
     * @return bool
     */
    protected function passesAuthorization() {
        if (method_exists($this, 'authorize')) {
            return $this->container->call([$this, 'authorize']);
        }

        return false;
    }

    /**
     * Handle a failed authorization attempt.
     *
     * @return void
     *
     * @throws \Illuminate\Http\Exception\HttpResponseException
     */
    protected function failedAuthorization() {
        throw new HttpResponseException($this->forbiddenResponse());
    }

    /**
     * Get the proper failed validation response for the request.
     *
     * @param  array  $errors
     * @return \Symfony\Component\HttpFoundation\Response
     */
    public function response(array $errors) {
        if ($this->ajax() || $this->wantsJson()) {
            return new JsonResponse($errors, 422);
        }

        return $this->redirector->to($this->getRedirectUrl())
                        ->withInput($this->except($this->dontFlash))
                        ->withErrors($errors, $this->errorBag);
    }

    /**
     * Get the response for a forbidden operation.
     *
     * @return \Illuminate\Http\Response
     */
    public function forbiddenResponse() {
        return new Response('Forbidden', 403);
    }

    /**
     * Format the errors from the given Validator instance.
     *
     * @param  \Illuminate\Contracts\Validation\Validator  $validator
     * @return array
     */
    protected function formatErrors(Validator $validator) {
        return $validator->getMessageBag()->toArray();
    }

    /**
     * Get the URL to redirect to on a validation error.
     *
     * @return string
     */
    protected function getRedirectUrl() {
        $url = $this->redirector->getUrlGenerator();

        if ($this->redirect) {
            return $url->to($this->redirect);
        } elseif ($this->redirectRoute) {
            return $url->route($this->redirectRoute);
        } elseif ($this->redirectAction) {
            return $url->action($this->redirectAction);
        }

        return $url->previous();
    }

    /**
     * Set the Redirector instance.
     *
     * @param  \Illuminate\Routing\Redirector  $redirector
     * @return \Illuminate\Foundation\Http\FormRequest
     */
    public function setRedirector(Redirector $redirector) {
        $this->redirector = $redirector;

        return $this;
    }

    /**
     * Set the container implementation.
     *
     * @param  \Illuminate\Container\Container  $container
     * @return $this
     */
    public function setContainer(Container $container) {
        $this->container = $container;

        return $this;
    }

    /**
     * Set custom messages for validator errors.
     *
     * @return array
     */
    public function messages() {
        return [];
    }

    /**
     * Set custom attributes for validator errors.
     *
     * @return array
     */
    public function attributes() {
        return [];
    }

}
