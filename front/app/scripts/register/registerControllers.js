interMap.controller('registerController', ['$scope', '$rootScope', '$http', '$state', 'growl', function ($scope, $rootScope, $http, $state, growl) {
        angular.extend($scope, {
            registerIn: function (registerForm) {
                console.log($scope.user);
                $http({
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    url: '/register',
                    method: 'POST',
                    data:  $scope.user
                }).success(function (response) {
                    if (response.success) {
                        $state.go('login');
                        growl.addSuccessMessage('Rejestracja przebiegła pomyślnie !');
                    } else {
                        $scope.error = response.error;
                    }
                });
            }
        });
    }]);
