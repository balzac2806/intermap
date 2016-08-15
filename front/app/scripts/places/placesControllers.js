interMap.controller('placesController', ['$scope', '$rootScope', '$http', '$state', 'growl', function ($scope, $rootScope, $http, $state, growl) {

        var url = '/api/place/';

        $scope.getPlaces = function () {
            return $http.get(url);
        };

        $scope.removePlace = function (id) {
            return $http.delete(url + id);
        }

        $scope.getPlaces()
                .then(function (response) {
                    if (response.data.success) {
                        $scope.places = response.data.data;
                    }
                });

        $scope.remove = function ($event, id) {
            $event.stopImmediatePropagation();

            $scope.removePlace(id).
                    success(function (data) {
                        if (data.success) {
                            angular.forEach($scope.places, function (val, key) {
                                if (val.id == id) {
                                    $scope.places.splice(key, 1);
                                }
                            });
                            growl.addSuccessMessage('Uczelnia została usunięta !');
                        } else if (data.error) {
                            growl.addErrorMessage(data.error);
                        }
                    });
        };

        $scope.editPlace = function (id) {
            var params = {};
            params.placeId = id;
            $state.go('editPlace', params);
        };

        $scope.addPlace = function () {
            $state.go('newPlace');
        };

    }]);

interMap.controller('placeController', ['$scope', '$stateParams', '$rootScope', '$http', '$state', 'growl', '$filter', function ($scope, $stateParams, $rootScope, $http, $state, growl, $filter) {

        if (angular.isDefined($stateParams.placeId)) {
            $scope.placeId = $stateParams.placeId;
        }

        $scope.editMode = false;
        $scope.place = {};

        var url = '/api/place/';

        if (angular.isDefined($scope.placeId)) {
            $scope.editMode = true;

            $http.get(url + $scope.placeId)
                    .then(function (response) {
                        if (response.data.success) {
                            $scope.place = response.data.place;
                            $scope.place.lat = parseFloat($scope.place.lat);
                            $scope.place.lng = parseFloat($scope.place.lng);
                        } else {
                            growl.addErrorMessage(response.data.error);
                        }
                    });
        }

        $http.get('/api/courses/place/')
                .then(function (response) {
                    if (response.data.success) {
                        $scope.courses = response.data.courses;
                    } else {
                        growl.addErrorMessage(response.data.error);
                    }
                });

        $scope.cancel = function () {
            $state.go('places');
        };

        $scope.savePlace = function (place, editMode) {
            if (editMode) {
                return $http.put(url + $scope.place.id, place)
                        .then(function (response) {
                            if (response.data.success) {
                                growl.addSuccessMessage('Uczelnia została zaktualizowana !');
                                $state.go('places');
                            } else {
                                $scope.error = response.data.error;
                            }
                        });
            } else {
                return $http.post(url, place)
                        .then(function (response) {
                            if (response.data.success) {
                                growl.addSuccessMessage('Uczelnia została dodana !');
                                $state.go('places');
                            } else {
                                $scope.error = response.data.error;
                            }
                        });
            }
        };

        $scope.autocomplete = function (search) {
            $http.get('/api/courses/place/find/', {params: {search: search}})
                    .then(function (data) {
                        if (data.success) {
                            var courses = [];
                            var courses = data.courses;
                            angular.forEach($scope.courses, function (val, key) {
                                angular.forEach(data.courses, function (v, k) {
                                    if (val == v.id) {
                                        courses.splice(k, 1);
                                    }
                                });
                            });
                            $scope.courses = courses;
                        }
                    });
        };

    }]);
