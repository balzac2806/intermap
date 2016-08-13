interMap.controller('rankController', ['$scope', '$rootScope', '$http', '$state', 'growl', '$uibModal', function ($scope, $rootScope, $http, $state, growl, $uibModal) {

        var url = '/api/rank/places';

        $scope.getPlaces = function () {
            return $http.get(url);
        };

        $scope.getPlaces()
                .then(function (response) {
                    if (response.data.success) {
                        $scope.places = response.data.data;
                    }
                });

        $scope.addRate = function (place) {
            var modalInstance = $uibModal.open({
                templateUrl: '/front/views/places-list/components/modal/rate.tpl.html',
                controller: 'placeModalController',
                resolve: {
                    place: function () {
                        return {
                            id: place.id,
                            name: place.name
                        };
                    }
                }
            });

            modalInstance.result.then(function (data) {
                $state.go($state.current, {}, {reload: true});
                growl.addSuccessMessage('Ankieta została dodana pomyślnie !');
            });
        };

    }]);