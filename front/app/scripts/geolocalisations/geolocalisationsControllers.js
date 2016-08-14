interMap.controller('geolocalisationsController', ['$scope', '$http', function ($scope, $http) {

        var url = '/api/geolocations';

        $scope.getPlaces = function (sortParam) {
            return $http.get(url);
        };


        $scope.getPlaces()
                .then(function (response) {
                    if (response.data.success) {
                        $scope.data = response.data.data;
                    }
                });

        $scope.getCoordinates = function () {
            var getUrl = '/api/geolocations/get-coordinates';

            $http.get(getUrl)
                    .then(function (response) {
                        if (response.data.success) {
                            $scope.getPlaces()
                                    .then(function (response) {
                                        if (response.data.success) {
                                            $scope.data = response.data.data;
                                        }
                                    });
                        }
                    });
        }

    }]);
