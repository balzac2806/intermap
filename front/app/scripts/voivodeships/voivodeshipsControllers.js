interMap.controller('voivodeshipsController', ['$scope', '$rootScope', '$http', '$state', 'growl', function ($scope, $rootScope, $http, $state, growl) {

        var url = '/api/voivodeships/';

        $scope.getVoivodeships = function () {
            return $http.get(url);
        };

        $scope.removeVoivodeship = function (id) {
            return $http.delete(url + id);
        }

        $scope.getVoivodeships()
                .then(function (response) {
                    if (response.data.success) {
                        $scope.voivodeships = response.data.data;
                    }
                });

        $scope.remove = function ($event, id) {
            $event.stopImmediatePropagation();

            $scope.removeVoivodeship(id).
                    success(function (data) {
                        if (data.success) {
                            angular.forEach($scope.voivodeships, function (val, key) {
                                if (val.id == data.voivodeship.id) {
                                    $scope.voivodeships.splice(key, 1);
                                }
                            });
                            growl.addSuccessMessage('Województwo zostało usunięte !');
                        } else if (data.error) {
                            growl.addErrorMessage(data.error);
                        }
                    });
        };

        $scope.editVoivodeship = function (id) {
            var params = {};
            params.voivodeshipId = id;
            $state.go('editVoivodeship', params);
        };

        $scope.addVoivodeship = function () {
            $state.go('newVoivodeship');
        };

    }]);

interMap.controller('voivodeshipController', ['$scope', '$stateParams', '$rootScope', '$http', '$state', 'growl', function ($scope, $stateParams, $rootScope, $http, $state, growl) {

        if (angular.isDefined($stateParams.voivodeshipId)) {
            $scope.voivodeshipId = $stateParams.voivodeshipId;
        }

        $scope.editMode = false;
        $scope.voivodeship = {};

        var url = '/api/voivodeships/';

        if (angular.isDefined($scope.voivodeshipId)) {
            $scope.editMode = true;

            $http.get(url + $scope.voivodeshipId)
                    .then(function (response) {
                        if (response.data.success) {
                            $scope.voivodeship = response.data.voivodeship;
                        } else {
                            growl.addErrorMessage(response.data.error);
                        }
                    });
        }

        $scope.cancel = function () {
            $state.go('voivodeships');
        };

        $scope.saveVoivodeship = function (voivodeship, editMode) {
            if (editMode) {
                return $http.put(url + $scope.voivodeship.id, voivodeship)
                        .then(function (response) {
                            if (response.data.success) {
                                growl.addSuccessMessage('Województwo zostało zaktualizowane !');
                                $state.go('voivodeships');
                            } else {
                                $scope.error = response.data.error;
                            }
                        });
            } else {
                return $http.post(url, voivodeship)
                        .then(function (response) {
                            if (response.data.success) {
                                growl.addSuccessMessage('Województwo zostało dodane !');
                                $state.go('voivodeships');
                            } else {
                                $scope.error = response.data.error;
                            }
                        });
            }
        };

    }]);
