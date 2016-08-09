interMap.controller('pollstersController', ['$scope', '$rootScope', '$http', '$state', 'growl', function ($scope, $rootScope, $http, $state, growl) {

        var url = '/api/pollsters/';

        $scope.getPollsters = function () {
            return $http.get(url);
        };

        $scope.removePollster = function (id) {
            return $http.delete(url + id);
        }

        $scope.getPollsters()
                .then(function (response) {
                    if (response.data.success) {
                        $scope.pollsters = response.data.data;
                    }
                });

        $scope.remove = function ($event, id) {
            $event.stopImmediatePropagation();

            $scope.removePollster(id).
                    success(function (data) {
                        if (data.success) {
                            console.log('data',data);
                            angular.forEach($scope.pollsters, function (val, key) {
                                if (val.id == data.pollster.id) {
                                    $scope.pollsters.splice(key, 1);
                                }
                            });
                            growl.addSuccessMessage('Ankieter został usunięty !');
                        } else if (data.error) {
                            growl.addErrorMessage(data.error);
                        }
                    });
        };

        $scope.editPollster = function (id) {
            var params = {};
            params.pollsterId = id;
            $state.go('editPollster', params);
        };

        $scope.addPollster = function () {
            $state.go('newPollster');
        };

    }]);

interMap.controller('pollsterController', ['$scope', '$stateParams', '$rootScope', '$http', '$state', 'growl', function ($scope, $stateParams, $rootScope, $http, $state, growl) {

        if (angular.isDefined($stateParams.pollsterId)) {
            $scope.pollsterId = $stateParams.pollsterId;
        }

        $scope.editMode = false;
        $scope.pollster = {};

        var url = '/api/pollsters/';

        if (angular.isDefined($scope.pollsterId)) {
            $scope.editMode = true;

            $http.get(url + $scope.pollsterId)
                    .then(function (response) {
                        if (response.data.success) {
                            $scope.pollster = response.data.pollster;
                        } else {
                            growl.addErrorMessage(response.data.error);
                        }
                    });
        }

        $scope.cancel = function () {
            $state.go('pollsters');
        };

        $scope.savePollster = function (pollster, editMode) {
            if (editMode) {
                return $http.put(url + $scope.pollster.id, pollster)
                        .then(function (response) {
                            if (response.data.success) {
                                growl.addSuccessMessage('Ankieter został zaktualizowany !');
                                $state.go('pollsters');
                            } else {
                                $scope.error = response.data.error;
                            }
                        });
            } else {
                return $http.post(url, pollster)
                        .then(function (response) {
                            if (response.data.success) {
                                growl.addSuccessMessage('Ankieter został dodany !');
                                $state.go('pollsters');
                            } else {
                                $scope.error = response.data.error;
                            }
                        });
            }
        };

    }]);
