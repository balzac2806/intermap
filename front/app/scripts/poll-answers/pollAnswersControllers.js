interMap.controller('pollAnswersController', ['$scope', '$rootScope', '$http', '$state', 'growl', function ($scope, $rootScope, $http, $state, growl) {

        var url = '/api/answers/';

        $scope.getPollAnswers = function () {
            return $http.get(url);
        };

        $scope.removePollAnswers = function (id) {
            return $http.delete(url + id);
        }
        
        $scope.status = {
            5: 'Niekatywna',
            10: 'Aktywna'
        };

        $scope.getPollAnswers()
                .then(function (response) {
                    if (response.data.success) {
                        $scope.answers = response.data.data;
                    }
                });

        $scope.remove = function ($event, id) {
            $event.stopImmediatePropagation();

            $scope.removePollAnswers(id).
                    success(function (data) {
                        if (data.success) {
                            angular.forEach($scope.answers, function (val, key) {
                                if (val.poll_id == data.poll.poll_id) {
                                    $scope.answers.splice(key, 1);
                                }
                            });
                            growl.addSuccessMessage('Ankieta została usunięta !');
                        } else if (data.error) {
                            growl.addErrorMessage(data.error);
                        }
                    });
        };

        $scope.editPollAnswers = function (id) {
            var params = {};
            params.pollId = id;
            $state.go('editPoll', params);
        };

        $scope.addPollAnswers = function () {
            $state.go('newPoll');
        };

    }]);

interMap.controller('pollAnswerController', ['$scope', '$stateParams', '$rootScope', '$http', '$state', 'growl', function ($scope, $stateParams, $rootScope, $http, $state, growl) {

        if (angular.isDefined($stateParams.pollId)) {
            $scope.pollId = $stateParams.pollId;
        }

        $scope.editMode = false;
        $scope.rate = {};

        var url = '/api/answers/';
        var pollUrl = '/api/poll/';
        var placeUrl = '/api/place/';

        $scope.getPlaces = function () {
            return $http.get(placeUrl);
        };

        $scope.getPlaces()
                .then(function (response) {
                    if (response.data.success) {
                        $scope.places = response.data.data;
                    }
                });

        $http.get(pollUrl)
                .then(function (response) {
                    if (response.data.success) {
                        $scope.questions = response.data.data;
                        $scope.statuses = response.data.statuses;
                        $scope.sexs = response.data.sex;
                        $scope.voivodeships = response.data.voivodeships;
                    } else {
                        growl.addErrorMessage(response.data.error);
                    }
                });

        if (angular.isDefined($scope.pollId)) {
            $scope.editMode = true;

            $http.get(url + $scope.pollId)
                    .then(function (response) {
                        if (response.data.success) {
                            $scope.rate = response.data.poll;
                        } else {
                            growl.addErrorMessage(response.data.error);
                        }
                    });
        }

        $scope.cancel = function () {
            $state.go('pollAnswers');
        };

        $scope.savePollAnswers = function (rate, editMode) {
            rate.user_id = $rootScope.permissions.user.id;
            rate.user_email = $rootScope.permissions.user.email;
            if (editMode) {
                return $http.put(url + rate.poll_id, rate)
                        .then(function (response) {
                            if (response.data.success) {
                                growl.addSuccessMessage('Ankieta została zaktualizowana !');
                                $state.go('pollAnswers');
                            } else {
                                $scope.error = response.data.error;
                            }
                        });
            } else {
                return $http.post(url, rate)
                        .then(function (response) {
                            if (response.data.success) {
                                growl.addSuccessMessage('Ankieta została dodana !');
                                $state.go('pollAnswers');
                            } else {
                                $scope.error = response.data.error;
                            }
                        });
            }
        };

    }]);
