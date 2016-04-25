interMap.controller('bodyController', ['$scope', '$rootScope', '$http', '$state', '$location', 'growl', function ($scope, $rootScope, $http, $state, $location, growl) {
        
        $rootScope.$state = $state;
        
        $scope.admin = false;
        
        if(angular.isDefined($rootScope.loggedUser)) {
            if($rootScope.loggedUser) {
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
            $state.go('login');
            growl.addErrorMessage('Zostałeś wylogowany ! Zapraszamy ponownie !');
        }
        
        $scope.register = function () {
            $state.go('register');
        }
        
        $scope.adminMenu = function() {
            $scope.admin = !$scope.admin;
        }
    }]);

