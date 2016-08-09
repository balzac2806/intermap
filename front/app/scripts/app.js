var interMap = angular.module('interMap', ['ngRoute', 'ngCookies', 'ui.router', 'angular-growl']);

interMap.config(['growlProvider', function (growlProvider) {
        growlProvider.globalTimeToLive(5000);
    }]);

interMap.config(['$stateProvider', '$urlRouterProvider',
    function ($stateProvider, $urlRouterProvider) {

        $urlRouterProvider.otherwise('/');

        $stateProvider
                .state('login', {
                    url: "/login",
                })
                .state('register', {
                    url: "/register",
                    templateUrl: "front/views/register/register.tpl.html",
                    controller: 'registerController',
                })
                .state('dashboard', {
                    url: "/dashboard",
                    templateUrl: "front/views/dashboard/dashboard.tpl.html",
                    controller: 'dashboardController',
                })
                .state('test', {
                    url: "/test",
                    templateUrl: "front/views/index/index.tpl.html",
                    controller: 'testController',
                })
                .state('admin', {
                    url: "/admin",
                    templateUrl: "front/views/admin/admin.tpl.html",
                    controller: 'adminController',
                })
                // Użytkownicy - Administracja
                .state('users', {
                    url: "/users",
                    templateUrl: "front/views/users/users.tpl.html",
                    controller: 'usersController',
                })
                .state('newUser', {
                    url: "/user",
                    templateUrl: "front/views/users/user.tpl.html",
                    controller: 'userController',
                })
                .state('editUser', {
                    url: "/user/:userId",
                    templateUrl: "front/views/users/user.tpl.html",
                    controller: 'userController',
                })
                // Uczelnie - Administracja
                .state('places', {
                    url: "/places",
                    templateUrl: "front/views/places/places.tpl.html",
                    controller: 'placesController',
                })
                .state('newPlace', {
                    url: "/place",
                    templateUrl: "front/views/places/place.tpl.html",
                    controller: 'placeController',
                })
                .state('editPlace', {
                    url: "/place/:placeId",
                    templateUrl: "front/views/places/place.tpl.html",
                    controller: 'placeController',
                })
                // Ankieta - Pytania
                .state('poll', {
                    url: "/poll",
                    templateUrl: "front/views/poll/poll.tpl.html",
                    controller: 'pollController',
                })
                .state('newQuestion', {
                    url: "/question",
                    templateUrl: "front/views/poll/question.tpl.html",
                    controller: 'questionController',
                })
                .state('editQuestion', {
                    url: "/question/:questionId",
                    templateUrl: "front/views/poll/question.tpl.html",
                    controller: 'questionController',
                })
                // Opinie
                .state('opinions', {
                    url: "/opinions",
                    templateUrl: "front/views/opinions/opinions.tpl.html",
                    controller: 'opinionsController',
                })
                .state('newOpinion', {
                    url: "/opinion",
                    templateUrl: "front/views/opinions/opinion.tpl.html",
                    controller: 'opinionController',
                })
                .state('editOpinion', {
                    url: "/opinion/:opinionId",
                    templateUrl: "front/views/opinions/opinion.tpl.html",
                    controller: 'opinionController',
                })
    }]);

