interMap.controller('usersController', ['$scope', '$rootScope', '$http', '$state', 'growl', function ($scope, $rootScope, $http, $state, growl) {

        var url = '/api/user/';

        $scope.getUsers = function () {
            return $http.get(url);
        };

        $scope.removeUser = function (id) {
            return $http.delete(url + id);
        }

        $scope.getUsers()
                .then(function (response) {
                    if (response.data.success) {
                        $scope.users = response.data.data;
                    }
                });

        $scope.remove = function ($event, id) {
            $event.stopImmediatePropagation();

            $scope.removeUser(id).
                    success(function (data) {
                        if (data.success) {
                            angular.forEach($scope.users, function (val, key) {
                                if (val.id == id) {
                                    $scope.users.splice(key, 1);
                                }
                            });
                            growl.addSuccessMessage('Użytkownik został usunięty !');
                        } else if (data.error) {
                            growl.addErrorMessage(data.error);
                        }
                    });
        };

        $scope.editUser = function (id) {
            var params = {};
            params.userId = id;
            $state.go('editUser', params);
        };

        $scope.addUser = function () {
            $state.go('newUser');
        };

    }]);

interMap.controller('userController', ['$scope', '$stateParams', '$rootScope', '$http', '$state', 'growl', function ($scope, $stateParams, $rootScope, $http, $state, growl) {

        if (angular.isDefined($stateParams.userId)) {
            $scope.userId = $stateParams.userId;
        }

        $scope.editMode = false;
        $scope.user = {};
        $scope.roles = ['user', 'admin'];

        var url = '/api/user/';

        if (angular.isDefined($scope.userId)) {
            $scope.editMode = true;

            $http.get(url + $scope.userId)
                    .then(function (response) {
                        if (response.data.success) {
                            $scope.user = response.data.user;
                        } else {
                            growl.addErrorMessage(response.data.error);
                        }
                    });
        }

        $scope.cancel = function () {
            $state.go('users');
        };

        $scope.saveUser = function (user, editMode) {
            if (editMode) {
                return $http.put(url + $scope.user.id, user)
                        .then(function (response) {
                            console.log(response);
                            if (response.data.success) {
                                growl.addSuccessMessage('Użytkownik został zaktualizowany !');
                                $state.go('users');
                            } else {
                                $scope.error = response.data.error;
                            }
                        });
            } else {
                return $http.post(url, user)
                        .then(function (response) {
                            console.log(response);
                            if (response.data.success) {
                                growl.addSuccessMessage('Użytkownik został dodany !');
                                $state.go('users');
                            } else {
                                $scope.error = response.data.error;
                            }
                        });
            }
        };

        $scope.passMismatched = function () {
            if (angular.isDefined($scope.userForm)) {
                return $scope.userForm.password_confirmation.$error.match;
            }
        };

    }]);
