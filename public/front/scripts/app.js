var interMap = angular.module('interMap', ['ngRoute', 'ngCookies', 'ui.router', 'angular-growl', 'ui.bootstrap', 'angular-input-stars', 
    'pascalprecht.translate', 'leaflet-directive']);

interMap.config(['growlProvider', function (growlProvider) {
        growlProvider.globalTimeToLive(5000);
    }]);

interMap.config(['$stateProvider', '$urlRouterProvider',
    function ($stateProvider, $urlRouterProvider) {

        $urlRouterProvider.otherwise('/');

        $stateProvider
                // Logowanie
                .state('login', {
                    url: "/login",
                })
                // Rejestracja
                .state('register', {
                    url: "/register",
                    templateUrl: "front/views/register/register.tpl.html",
                    controller: 'registerController',
                })
                // Dashboard
                .state('dashboard', {
                    url: "/dashboard",
                    templateUrl: "front/views/dashboard/dashboard.tpl.html",
                    controller: 'dashboardController',
                })
                // Lista - Uczelnie
                .state('placesList', {
                    url: "/places/list",
                    templateUrl: "front/views/places-list/places.tpl.html",
                    controller: 'placesListController',
                })
                // Ranking - Uczelnie
                .state('placesRank', {
                    url: "/places/rank",
                    templateUrl: "front/views/rank/places.tpl.html",
                    controller: 'rankController',
                })
                // Mapa - Uczelnie
                .state('placesMap', {
                    url: "/places/map",
                    templateUrl: "front/views/map/places.tpl.html",
                    controller: 'mapController',
                })
                // Lista - Uczelnie
                .state('placeView', {
                    url: "/places/:placeId",
                    templateUrl: "front/views/places-list/place.tpl.html",
                    controller: 'placePageController',
                })
                // Abstract - Administracja
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
                // Ankiety
                .state('pollAnswers', {
                    url: "/poll-answers",
                    templateUrl: "front/views/poll-answers/pollAnswers.tpl.html",
                    controller: 'pollAnswersController',
                })
                .state('newPoll', {
                    url: "/poll-answer",
                    templateUrl: "front/views/poll-answers/poll.tpl.html",
                    controller: 'pollAnswerController',
                })
                .state('editPoll', {
                    url: "/poll-answer/:pollId",
                    templateUrl: "front/views/poll-answers/poll.tpl.html",
                    controller: 'pollAnswerController',
                })
                // Ankieterzy
                .state('pollsters', {
                    url: "/pollsters",
                    templateUrl: "front/views/pollsters/pollsters.tpl.html",
                    controller: 'pollstersController',
                })
                .state('newPollster', {
                    url: "/pollster",
                    templateUrl: "front/views/pollsters/pollster.tpl.html",
                    controller: 'pollsterController',
                })
                .state('editPollster', {
                    url: "/pollster/:pollsterId",
                    templateUrl: "front/views/pollsters/pollster.tpl.html",
                    controller: 'pollsterController',
                })
    }]);


//# sourceMappingURL=app.js.map
