interMap.controller('mapController', ['$scope', 'LocalizationMapService', 'MapService', '$http', function ($scope, LocalizationMapService, MapService, $http) {
        $scope.map = LocalizationMapService.initMap();
        $scope.map = LocalizationMapService.getMap();
        $scope.map.fireEvent('resize');

        var url = '/api/map/geolocations';

        $http.get(url)
                .then(function (response) {
                    if (response.data.success) {
                        $scope.points = response.data;
//                        $scope.place.lng = parseFloat($scope.place.lng);
                    } 
                });
    }]);
