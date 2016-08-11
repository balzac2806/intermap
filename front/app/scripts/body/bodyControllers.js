interMap.controller('bodyController', ['$scope', '$rootScope', '$http', '$state', '$location', 'growl', '$cookies',
    function ($scope, $rootScope, $http, $state, $location, growl, $cookies) {
        $rootScope.$state = $state;
        $scope.admin = false;

        var loginStatus = $cookies.getObject('logged');

        if (angular.isDefined($rootScope.loggedUser) || loginStatus) {
            if ($rootScope.loggedUser) {
                $scope.loggedUser = true;
            } else {
                $rootScope.permissions = {};
                $rootScope.permissions.user = loginStatus;
                $scope.loggedUser = true;
            }
        } else {
            $scope.loggedUser = false;
            $state.go('login');
        }

        angular.extend($scope, {
            logIn: function (loginForm) {
                $http({
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    url: '/auth',
                    method: 'POST',
                    data: {
                        email: $scope.login.username,
                        password: $scope.login.password
                    }
                }).success(function (response) {
                    if (response.success) {
                        $rootScope.permissions = {};
                        $rootScope.permissions.user = response.data;
                        $rootScope.loggedUser = true;
                        $scope.loggedUser = true;
                        $cookies.putObject('logged', response.data);
                        $state.go('dashboard');
                        growl.addSuccessMessage('Witaj ' + response.data.name + '!');
                    } else {
                        growl.addErrorMessage(response.error);
                    }
                });
            }
        });

        $scope.logout = function () {
            $scope.loggedUser = false;
            $rootScope.loggedUser = false;
            $cookies.remove('logged');
            $state.go('login');
            growl.addErrorMessage('Zostałeś wylogowany ! Zapraszamy ponownie !');
        }

        $scope.register = function () {
            $state.go('register');
        }

        $scope.isActive = function (state, menuState) {
            var menuActive = state.current.menuActive;
            return state.current.name == menuState || (angular.isDefined(menuActive) && menuActive == menuState);
        };

        $scope.adminMenu = function () {
            $scope.admin = !$scope.admin;
        }
    }]);

