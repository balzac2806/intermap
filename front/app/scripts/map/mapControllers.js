interMap.controller('mapController', ['$scope', 'LocalizationMapService', 'MapService', function ($scope, LocalizationMapService, MapService) {
        $scope.map = LocalizationMapService.initMap();
        $scope.map = LocalizationMapService.getMap();
        $scope.map.fireEvent('resize');
    }]);
