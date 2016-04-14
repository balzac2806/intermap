interMap.directive('navBar', function () {
    return {
        restrict: 'AE',
        controller: function ($scope, $cookieStore) {
            var mobileView = 992;

            $scope.toggle = true;

            $scope.getWidth = function () {
                return window.innerWidth;
            };

            $scope.$watch($scope.getWidth, function (newValue, oldValue) {
                if (newValue >= mobileView) {
                    if (angular.isDefined($cookieStore.get('toggle'))) {
                        $scope.toggle = !$cookieStore.get('toggle') ? false : true;
                    } else {
                        $scope.toggle = true;
                    }
                } else {
                    $scope.toggle = false;
                }

            });

            $scope.toggleSidebar = function () {
                $scope.toggle = !$scope.toggle;
            };

            window.onresize = function () {
                $scope.$apply();
            };
        },
        templateUrl: 'front/views/body/components/navBar.tpl.html'
    }
});

interMap.directive('headerBar', function () {
    return {
        restrict: 'AE',
        controller: function ($scope) {
            $scope.toggleDropdownOne = function () {
                $scope.dropdownOne = !$scope.dropdownOne;
                $scope.dropdownTwo = false;
            };
            
            $scope.toggleDropdownTwo = function () {
                $scope.dropdownTwo = !$scope.dropdownTwo;
                $scope.dropdownOne = false;
            };
        },
        templateUrl: 'front/views/body/components/headerBar.tpl.html'
    }
});