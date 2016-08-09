interMap.controller('pollController', ['$scope', '$rootScope', '$http', '$state', 'growl', function ($scope, $rootScope, $http, $state, growl) {

        var url = '/api/poll/';

        $scope.getQuestions = function () {
            return $http.get(url);
        };

        $scope.removeQuestion = function (id) {
            return $http.delete(url + id);
        }

        $scope.getQuestions()
                .then(function (response) {
                    if (response.data.success) {
                        $scope.questions = response.data.data;
                    }
                });

        $scope.remove = function ($event, id) {
            $event.stopImmediatePropagation();

            $scope.removeQuestion(id).
                    success(function (data) {
                        if (data.success) {
                            angular.forEach($scope.questions, function (val, key) {
                                if (val.id == id) {
                                    $scope.questions.splice(key, 1);
                                }
                            });
                            growl.addSuccessMessage('Pytanie zostało usunięte !');
                        } else if (data.error) {
                            growl.addErrorMessage(data.error);
                        }
                    });
        };

        $scope.editQuestion = function (id) {
            var params = {};
            params.questionId = id;
            $state.go('editQuestion', params);
        };

        $scope.addQuestion = function () {
            $state.go('newQuestion');
        };

    }]);

interMap.controller('questionController', ['$scope', '$stateParams', '$rootScope', '$http', '$state', 'growl', function ($scope, $stateParams, $rootScope, $http, $state, growl) {

        if (angular.isDefined($stateParams.questionId)) {
            $scope.questionId = $stateParams.questionId;
        }

        $scope.editMode = false;
        $scope.question = {};

        var url = '/api/poll/';

        if (angular.isDefined($scope.questionId)) {
            $scope.editMode = true;

            $http.get(url + $scope.questionId)
                    .then(function (response) {
                        if (response.data.success) {
                            $scope.question = response.data.question;
                        } else {
                            growl.addErrorMessage(response.data.error);
                        }
                    });
        }

        $scope.cancel = function () {
            $state.go('poll');
        };

        $scope.saveQuestion = function (question, editMode) {
            if (editMode) {
                return $http.put(url + $scope.question.id, question)
                        .then(function (response) {
                            if (response.data.success) {
                                growl.addSuccessMessage('Pytanie zostało zaktualizowane !');
                                $state.go('poll');
                            } else {
                                $scope.error = response.data.error;
                            }
                        });
            } else {
                return $http.post(url, question)
                        .then(function (response) {
                            if (response.data.success) {
                                growl.addSuccessMessage('Pytanie zostało dodane !');
                                $state.go('poll');
                            } else {
                                $scope.error = response.data.error;
                            }
                        });
            }
        };

    }]);
