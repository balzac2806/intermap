interMap.controller('opinionsController', ['$scope', '$rootScope', '$http', '$state', 'growl', function ($scope, $rootScope, $http, $state, growl) {

        var url = '/api/opinion/';

        $scope.getOpinions = function () {
            return $http.get(url);
        };

        $scope.removeOpinion = function (id) {
            return $http.delete(url + id);
        }
        
        $scope.status = {
            5: 'Niekatywna',
            10: 'Aktywna'
        };

        $scope.getOpinions()
                .then(function (response) {
                    if (response.data.success) {
                        $scope.opinions = response.data.data;
                    }
                });

        $scope.remove = function ($event, id) {
            $event.stopImmediatePropagation();

            $scope.removeOpinion(id).
                    success(function (data) {
                        if (data.success) {
                            angular.forEach($scope.opinions, function (val, key) {
                                if (val.id == id) {
                                    $scope.opinions.splice(key, 1);
                                }
                            });
                            growl.addSuccessMessage('Opinia została usunięta !');
                        } else if (data.error) {
                            growl.addErrorMessage(data.error);
                        }
                    });
        };

        $scope.editOpinion = function (id) {
            var params = {};
            params.opinionId = id;
            $state.go('editOpinion', params);
        };

        $scope.addOpinion = function () {
            $state.go('newOpinion');
        };

    }]);

interMap.controller('opinionController', ['$scope', '$stateParams', '$rootScope', '$http', '$state', 'growl', function ($scope, $stateParams, $rootScope, $http, $state, growl) {

        if (angular.isDefined($stateParams.opinionId)) {
            $scope.opinionId = $stateParams.opinionId;
        }

        $scope.editMode = false;
        $scope.opinion = {};

        var url = '/api/opinion/';

        if (angular.isDefined($scope.opinionId)) {
            $scope.editMode = true;

            $http.get(url + $scope.opinionId)
                    .then(function (response) {
                        if (response.data.success) {
                            $scope.opinion = response.data.opinion;
                        } else {
                            growl.addErrorMessage(response.data.error);
                        }
                    });
        }

        $scope.cancel = function () {
            $state.go('opinions');
        };

        $scope.saveOpinion = function (opinion, editMode) {
            if (editMode) {
                return $http.put(url + $scope.opinion.id, opinion)
                        .then(function (response) {
                            if (response.data.success) {
                                growl.addSuccessMessage('Opinia została zaktualizowana !');
                                $state.go('opinions');
                            } else {
                                $scope.error = response.data.error;
                            }
                        });
            } else {
                return $http.post(url, opinion)
                        .then(function (response) {
                            if (response.data.success) {
                                growl.addSuccessMessage('Opinia została dodana !');
                                $state.go('opinions');
                            } else {
                                $scope.error = response.data.error;
                            }
                        });
            }
        };

    }]);
