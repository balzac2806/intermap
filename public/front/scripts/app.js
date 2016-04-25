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
    }]);


//# sourceMappingURL=app.js.map
