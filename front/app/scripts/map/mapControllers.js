interMap.controller('mapController', ['$scope', 'LocalizationMapService', 'MapService', '$http', function ($scope, LocalizationMapService, MapService, $http) {
        $scope.map = LocalizationMapService.initMap();

        var url = '/api/map/geolocations';

        $http.get(url)
                .then(function (response) {
                    if (response.data.success) {
                        $scope.data = response.data.data;
                        $scope.points = LocalizationMapService.displayLocalizations($scope.data);
                        $scope.map = LocalizationMapService.getMap();
                        $scope.map.fireEvent('resize');
                    }
                });

        $scope.selectPoint = function (point) {
            var zoom = checkZoomByRadius(point);
            $scope.point = angular.copy(point);
            $scope.point.lat = parseFloat($scope.point.lat);
            $scope.point.lng = parseFloat($scope.point.lng);
            $('#map')[0].scrollIntoView(true);
            LocalizationMapService.changeView($scope.point.lat, $scope.point.lng, zoom);
        };

        /**
         * Zwraca zoom w zależności od zdefiniowania pola radius
         * @param {type} point
         * @returns zoom
         */
        function checkZoomByRadius(point) {
            var zoom;
            if (angular.isDefined(point.radius)) {
                zoom = LocalizationMapService.zoomByRadius(point.radius);
            } else {
                zoom = LocalizationMapService.maxZoom;
            }
            return zoom;
        }
    }]);
