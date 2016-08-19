interMap.controller('coursesController', ['$scope', '$rootScope', '$http', '$state', 'growl', function ($scope, $rootScope, $http, $state, growl) {

        var url = '/api/courses/';

        $scope.getCourses = function () {
            return $http.get(url);
        };

        $scope.removeCourse = function (id) {
            return $http.delete(url + id);
        }

        $scope.getCourses()
                .then(function (response) {
                    if (response.data.success) {
                        $scope.courses = response.data.data;
                    }
                });

        $scope.remove = function ($event, id) {
            $event.stopImmediatePropagation();

            $scope.removeCourse(id).
                    success(function (data) {
                        if (data.success) {
                            angular.forEach($scope.courses, function (val, key) {
                                if (val.id == data.course.id) {
                                    $scope.courses.splice(key, 1);
                                }
                            });
                            growl.addSuccessMessage('Kierunek został usunięty !');
                        } else if (data.error) {
                            growl.addErrorMessage(data.error);
                        }
                    });
        };

        $scope.editCourse = function (id) {
            var params = {};
            params.courseId = id;
            $state.go('editCourse', params);
        };

        $scope.addCourse = function () {
            $state.go('newCourse');
        };

    }]);

interMap.controller('courseController', ['$scope', '$stateParams', '$rootScope', '$http', '$state', 'growl', function ($scope, $stateParams, $rootScope, $http, $state, growl) {

        if (angular.isDefined($stateParams.courseId)) {
            $scope.courseId = $stateParams.courseId;
        }

        $scope.editMode = false;
        $scope.course = {};

        var url = '/api/courses/';

        if (angular.isDefined($scope.courseId)) {
            $scope.editMode = true;

            $http.get(url + $scope.courseId)
                    .then(function (response) {
                        if (response.data.success) {
                            $scope.course = response.data.course;
                        } else {
                            growl.addErrorMessage(response.data.error);
                        }
                    });
        }

        $scope.cancel = function () {
            $state.go('courses');
        };

        $scope.saveCourse = function (course, editMode) {
            if (editMode) {
                return $http.put(url + $scope.course.id, course)
                        .then(function (response) {
                            if (response.data.success) {
                                growl.addSuccessMessage('Kierunek został zaktualizowany !');
                                $state.go('courses');
                            } else {
                                $scope.error = response.data.error;
                            }
                        });
            } else {
                return $http.post(url, course)
                        .then(function (response) {
                            if (response.data.success) {
                                growl.addSuccessMessage('Kierunek został dodany !');
                                $state.go('courses');
                            } else {
                                if (angular.isDefined(response.data.error)) {
                                    if (angular.isDefined(response.data.error.name) && response.data.error.name[0] == 'Adres name jest już zajęty.') {
                                        growl.addErrorMessage('Już istnieje kierunek o takiej nazwie !');
                                    }
                                }
                                $scope.error = response.data.error;
                            }
                        });
            }
        };

    }]);
