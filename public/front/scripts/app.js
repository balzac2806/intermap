var interMap = angular.module('interMap', ['ngRoute', 'ngCookies', 'ui.router', 'angular-growl']);

interMap.config(['growlProvider', function(growlProvider) {
    growlProvider.globalTimeToLive(5000);
}]);

interMap.config(['$stateProvider', '$urlRouterProvider',
    function ($stateProvider, $urlRouterProvider) {

//        $urlRouterProvider.otherwise('/');
        
        $stateProvider
                .state('dashboard', {
                    url: "/dashboard",
                    templateUrl: "front/views/dashboard/dashboard.tpl.html",
                    controller: 'dashboardController'
                })
                .state('test', {
                    url: "/test",
                    templateUrl: "front/views/index/index.tpl.html",
                    controller: 'testController'
                })
    }]);


//# sourceMappingURL=app.js.map
