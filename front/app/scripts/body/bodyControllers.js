interMap.controller('bodyController', ['$scope', '$http', '$location', 'growl', function ($scope, $http, $location, growl) {
        
        $scope.loggedUser = false;
        
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
                        $scope.loggedUser = true;
                        $location.path('/dashboard');
                        growl.addSuccessMessage('Witaj ' + response.data.name + '!');
                    } else {
                        growl.addErrorMessage(response.error);
                    }
                });
            }
        });
    }]);

