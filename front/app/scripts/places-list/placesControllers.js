interMap.controller('placesListController', ['$scope', '$rootScope', '$http', '$state', 'growl', '$uibModal', function ($scope, $rootScope, $http, $state, growl, $uibModal) {

        var url = '/api/place/';

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

interMap.controller('placePageController', ['$scope', '$stateParams', '$rootScope', '$http', '$state', 'growl', '$uibModal', function ($scope, $stateParams, $rootScope, $http, $state, growl, $uibModal) {

        if (angular.isDefined($stateParams.placeId)) {
            $scope.placeId = $stateParams.placeId;
        }

        $scope.isLoading = true;

        $scope.place = {};
        $scope.opinions = [];

        var url = '/api/place/';

        if (angular.isDefined($scope.placeId)) {
            $scope.editMode = true;

            $http.get(url + $scope.placeId)
                    .then(function (response) {
                        if (response.data.success) {
                            $scope.place = response.data.place;
                            $scope.rate_place = response.data.place.rate;
                            $scope.opinions = response.data.opinions;
                            $scope.users = response.data.users;
                        } else {
                            growl.addErrorMessage(response.data.error);
                        }
                    })
                    .finally(function () {
                        $scope.isLoading = false;
                    });
        }


        $scope.addRate = function (placeId) {
            var modalInstance = $uibModal.open({
                templateUrl: '/front/views/places-list/components/modal/rate.tpl.html',
                controller: 'placeModalController',
                resolve: {
                    place: function () {
                        return {
                            id: placeId,
                            name: $scope.place.name
                        };
                    }
                }
            });

            modalInstance.result.then(function (data) {
                $state.go($state.current, {}, {reload: true});
                growl.addSuccessMessage('Ankieta została dodana pomyślnie !');
            });
        };

        $scope.addOpinion = function (opinion) {
            if (angular.isDefined(opinion.opinion)) {
                var opinionUrl = '/api/opinion/';
                opinion.object_id = $scope.placeId;
                opinion.user_id = $rootScope.permissions.user.id;
                $http.post(opinionUrl, opinion).
                        success(function (response) {
                            if (response.success) {
                                $scope.opinions.push(response.opinion);
                                $scope.new_opinion.opinion = '';
                            } else {
                                if (typeof response.error === 'object') {
                                    $scope.formErrors = response.error;
                                } else {
                                    growl.addErrorMessage('Nie udało się dodać opinii !');
                                }
                            }
                        }).
                        finally(function () {
                            $scope.isLoading = false;
                        });
            }
        };

        $scope.cancel = function () {
            $state.go('placesList');
        };

    }]);

interMap.controller('placeModalController', ['$scope', '$stateParams', '$rootScope', '$http', '$state', 'growl', 'place', '$uibModalInstance', function ($scope, $stateParams, $rootScope, $http, $state, growl, place, $uibModalInstance) {

        $scope.rate = {};

        if (angular.isDefined(place)) {
            $scope.placeId = place.id;
            $scope.rate.object_id = place.id;
            $scope.place = place;
        }

        var pollUrl = '/api/poll/';

        $http.get(pollUrl)
                .then(function (response) {
                    if (response.data.success) {
                        $scope.questions = response.data.data;
                        $scope.statuses = response.data.statuses;
                        $scope.sexs = response.data.sex;
                        $scope.students = response.data.students;
                        $scope.voivodeships = response.data.voivodeships;
                    } else {
                        growl.addErrorMessage(response.data.error);
                    }
                });

        var pollAnswerUrl = '/api/answers/';

        $scope.save = function () {
            $scope.isLoading = true;
            $scope.rate.user_id = $rootScope.permissions.user.id;
            $scope.rate.user_email = $rootScope.permissions.user.email;
            $http.post(pollAnswerUrl, $scope.rate).
                    success(function (data) {
                        if (data.success) {
                            $uibModalInstance.close(data.rate);
                        } else {
                            if (typeof data.error === 'object') {
                                $scope.formErrors = data.error;
                            } else {
                                growl.addErrorMessage('Nie udało się dodać ankiety !');
                            }
                        }
                    }).
                    finally(function () {
                        $scope.isLoading = false;
                    });
        };

        $scope.cancel = function () {
            $uibModalInstance.dismiss('cancel');
        };

    }]);

interMap.factory('stars', [function () {
        /**
         * Draw wrapping rectangle
         *
         * @param ctx {Object} 2d context
         * @param dim {Number}
         * @param backColor {String}
         */
        function _drawRect(ctx, dim, backColor) {
            if (!ctx)
                throw Error('No Canvas context found!');
            ctx.save();
            ctx.width = dim;
            ctx.height = dim;
            ctx.fillStyle = backColor;
            ctx.fillRect(0, 0, dim, dim);
            ctx.restore();
        }
        /**
         * Draw one star with certain general params
         *
         * @param empty {Boolean} Draw transparent or filled star
         * @param ctx {Object} 2d context
         * @param x {Number}
         * @param y {Number}
         * @param r {Number}
         * @param p {Number}
         * @param m {Number}
         * @param style {String} Star background color (in case of filled star)
         * @private
         */
        function _star(empty, ctx, x, y, r, p, m, style) {
            if (!ctx)
                throw Error('No Canvas context found!');
            ctx.save();
            if (empty) {
                ctx.globalCompositeOperation = 'destination-out';
            } else {
                ctx.fillStyle = style || 'gold';
            }
            ctx.beginPath();
            ctx.translate(x, y);
            ctx.moveTo(0, 0 - r);
            for (var i = 0; i < p; i++)
            {
                ctx.rotate(Math.PI / p);
                ctx.lineTo(0, 0 - (r * m));
                ctx.rotate(Math.PI / p);
                ctx.lineTo(0, 0 - r);
            }
            ctx.fill();
            ctx.restore();
        }
        // Draw one empty star
        function emptyStar(ctx, r, rectBackColor) {
            _drawRect(ctx, r * 2, rectBackColor);
            _star(true, ctx, r, r, r, 5, 0.5);
        }
        // Draw one filled star
        function filledStar(ctx, r, rectBackColor, style) {
            _drawRect(ctx, r * 2, rectBackColor);
            _star(false, ctx, r, r, r, 5, 0.5, style);
        }
        // Current API
        return {
            emptyStar: emptyStar
        }
    }]);

interMap.factory('starsUtility', [function () {
        /**
         * Creates an array with index values
         *
         * @param n {Number}
         * @returns {Array}
         */
        var createRange = function (n) {
            var i = 0;
            var range = new Array(n);
            while (i < n) {
                range[i++] = i;
            }
            return range;
        };
        /**
         * Calculate percent of area to filled with color star
         *
         * @param attrs {Object}
         * @returns {Number}
         */
        var calculatePercent = function (attrs) {
            var percent, stars, selectedStars;
            if (!attrs) {
                return 0;
            } else if (attrs.ratingPercent) {
                percent = parseInt(attrs.ratingPercent) ? parseInt(attrs.ratingPercent) : 0;
                return percent > 100 ? 100 : percent;
            } else if (attrs.ratingStars) {
                stars = parseInt(attrs.stars || 5);
                selectedStars = parseFloat(attrs.ratingStars) > stars ? stars : parseFloat(attrs.ratingStars);
                return (100 / stars) * selectedStars || 0.0;
            }
        };
        /**
         * Calculate how many stars should be filled (in percent)
         *
         * @param totalStars
         * @param totalWidth
         * @param starWidth
         * @param width
         * @returns {number}
         */
        var percentFullStars = function (totalStars, totalWidth, starWidth, width) {
            var pxPerOneStar = totalWidth / totalStars;
            var percentPerOneStar = 100 / totalStars;
            return Math.ceil(width / pxPerOneStar) * percentPerOneStar;
        };
        /**
         * Calculate stars in percents
         *
         * @param totalStars
         * @param percent
         * @param precision
         * @returns {string}
         */
        var starsByPercent = function (totalStars, percent, precision) {
            var percentPerOneStar = 100 / totalStars;
            return (percent / percentPerOneStar).toFixed(precision || 2);
        };
        return {
            createRange: createRange,
            calculatePercent: calculatePercent,
            percentFullStars: percentFullStars,
            starsByPercent: starsByPercent
        };
    }]);
// ------------------------
//        DIRECTIVE
// ------------------------
interMap.directive('starRating', ['$compile', '$templateCache', '$timeout', function ($compile, $templateCache, $timeout) {
        return {
            restrict: 'A',
            scope: {
                percent: "=outerPercent",
                starsSelected: "=outerStarSelection"
            },
            template: '<div class="stars" style="background-color: {{emptyBackColor}}"><div class="stars-selected" style="width: {{percent}}%; background-color: {{selColor}};"></div></div>',
            controller: function ($scope, stars, starsUtility) {
                // Apply Utilities
                for (var method in starsUtility) {
                    (function (m) {
                        $scope[m] = function () {
                            return starsUtility[m].apply(null, arguments);
                        };
                    }(method));
                }
                // Invoke the factory method: draw transparent star
                $scope.drawStar = function () {
                    return stars.emptyStar.apply(null, arguments);
                };
            },
            link: function ($scope, el, attrs) {
                // Configs
                var starEl = [];
                var wrapper = angular.element(el[0].querySelector('.stars'));
                var filler = angular.element(el[0].querySelector('.stars-selected'));
                $scope.howManyStars = $scope.createRange(attrs.stars) || $scope.createRange(5);
                $scope.starRadius = parseInt(attrs.starRadius) || 20;
                $scope.percent = $scope.prevPercent = $scope.calculatePercent(attrs);
                $scope.backColor = attrs.backColor || 'white';
                $scope.emptyBackColor = attrs.emptyBackColor || '#d3d3d3';
                $scope.selColor = attrs.selColor || 'gold';
                $scope.ratingDefine = attrs.ratingDefine || false;
                // Allowed to define a new rating?
                // -------------------------------
                if ($scope.ratingDefine) {
                    // watch percent value to update the view
                    $scope.$watch('percent', function (newValue, oldValue) {
                        filler.css('width', newValue + '%');
                        $scope.starsSelected = $scope.starsByPercent($scope.howManyStars.length, $scope.percent);
                    });
                    // handle events to change the rating
                    $scope.changeRating = function (e) {
                        var el = wrapper[0];
                        var w = el.offsetWidth;
                        var selected = e.clientX - el.getBoundingClientRect().left + 1;
                        var newPercent = $scope.ratingDefine == 'star' ? $scope.percentFullStars($scope.howManyStars.length, w, $scope.starRadius * 2, selected) : Math.floor((selected * 100) / w);
                        $scope.percent = newPercent > 100 ? 100 : newPercent;
                    };
                    $scope.leaveRating = function () {
                        $scope.percent = $scope.prevPercent;
                    };
                    $scope.secureNewRating = function () {
                        $scope.prevPercent = $scope.percent;
                    };
                }
                // add canvas to DOM first
                $scope.howManyStars.forEach(function () {
                    var star = angular.element('<canvas class="star" height="{{starRadius*2}}" width="{{starRadius*2}}"></canvas>');
                    $compile(star)($scope);
                    wrapper.append(star);
                    starEl.push(star);
                });
                // we should wait for next JS 'tick' to show up the stars
                $timeout(function () {
                    starEl.forEach(function (el) {
                        $scope.drawStar(el[0].getContext("2d"), $scope.starRadius, $scope.backColor);
                    });
                    wrapper.css('visibility', 'visible'); // this to avoid to show partly rendered layout
                });
            }
        };
    }]);
