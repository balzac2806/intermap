interMap.controller('dashboardController', ['$scope', function ($scope) {
    }]);
interMap.controller('testController', ['$scope', function ($scope) {
    }]);

interMap.controller('bodyController', ['$scope', '$rootScope', '$http', '$state', '$location', 'growl', '$cookies',
    function ($scope, $rootScope, $http, $state, $location, growl, $cookies) {
        $rootScope.$state = $state;
        $scope.admin = false;

        var loginStatus = $cookies.getObject('logged');

        if (angular.isDefined($rootScope.loggedUser) || loginStatus) {
            if ($rootScope.loggedUser) {
                $scope.loggedUser = true;
            } else {
                $rootScope.permissions = {};
                $rootScope.permissions.user = loginStatus;
                $scope.loggedUser = true;
            }
        } else {
            $scope.loggedUser = false;
            $state.go('login');
        }

        angular.extend($scope, {
            logIn: function (loginForm) {
                $http({
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    url: '/auth',
                    method: 'POST',
                    data: {
                        email: $scope.login.username,
                        password: $scope.login.password
                    }
                }).success(function (response) {
                    if (response.success) {
                        $rootScope.permissions = {};
                        $rootScope.permissions.user = response.data;
                        $rootScope.loggedUser = true;
                        $scope.loggedUser = true;
                        $cookies.putObject('logged', response.data);
                        $state.go('dashboard');
                        growl.addSuccessMessage('Witaj ' + response.data.name + '!');
                    } else {
                        growl.addErrorMessage(response.error);
                    }
                });
            }
        });

        $scope.logout = function () {
            $scope.loggedUser = false;
            $rootScope.loggedUser = false;
            $cookies.remove('logged');
            $state.go('login');
            growl.addErrorMessage('Zostałeś wylogowany ! Zapraszamy ponownie !');
        }

        $scope.register = function () {
            $state.go('register');
        }

        $scope.isActive = function (state, menuState) {
            var menuActive = state.current.menuActive;
            return state.current.name == menuState || (angular.isDefined(menuActive) && menuActive == menuState);
        };

        $scope.adminMenu = function () {
            $scope.admin = !$scope.admin;
        }
    }]);


interMap.controller('registerController', ['$scope', '$rootScope', '$http', '$state', 'growl', function ($scope, $rootScope, $http, $state, growl) {
        angular.extend($scope, {
            registerIn: function (registerForm) {
                console.log($scope.user);
                $http({
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    url: '/register',
                    method: 'POST',
                    data:  $scope.user
                }).success(function (response) {
                    if (response.success) {
                        $state.go('login');
                        growl.addSuccessMessage('Rejestracja przebiegła pomyślnie !');
                    } else {
                        $scope.error = response.error;
                    }
                });
            }
        });
    }]);

interMap.controller('adminController', ['$scope', '$rootScope', '$http', '$state', 'growl', function ($scope, $rootScope, $http, $state, growl) {

    }]);

interMap.controller('usersController', ['$scope', '$rootScope', '$http', '$state', 'growl', function ($scope, $rootScope, $http, $state, growl) {

        var url = '/api/user/';

        $scope.getUsers = function () {
            return $http.get(url);
        };

        $scope.removeUser = function (id) {
            return $http.delete(url + id);
        }

        $scope.getUsers()
                .then(function (response) {
                    if (response.data.success) {
                        $scope.users = response.data.data;
                    }
                });

        $scope.remove = function ($event, id) {
            $event.stopImmediatePropagation();

            $scope.removeUser(id).
                    success(function (data) {
                        if (data.success) {
                            angular.forEach($scope.users, function (val, key) {
                                if (val.id == id) {
                                    $scope.users.splice(key, 1);
                                }
                            });
                            growl.addSuccessMessage('Użytkownik został usunięty !');
                        } else if (data.error) {
                            growl.addErrorMessage(data.error);
                        }
                    });
        };

        $scope.editUser = function (id) {
            var params = {};
            params.userId = id;
            $state.go('editUser', params);
        };

        $scope.addUser = function () {
            $state.go('newUser');
        };

    }]);

interMap.controller('userController', ['$scope', '$stateParams', '$rootScope', '$http', '$state', 'growl', function ($scope, $stateParams, $rootScope, $http, $state, growl) {

        if (angular.isDefined($stateParams.userId)) {
            $scope.userId = $stateParams.userId;
        }

        $scope.editMode = false;
        $scope.user = {};
        $scope.roles = ['user', 'admin'];

        var url = '/api/user/';

        if (angular.isDefined($scope.userId)) {
            $scope.editMode = true;

            $http.get(url + $scope.userId)
                    .then(function (response) {
                        if (response.data.success) {
                            $scope.user = response.data.user;
                        } else {
                            growl.addErrorMessage(response.data.error);
                        }
                    });
        }

        $scope.cancel = function () {
            $state.go('users');
        };

        $scope.saveUser = function (user, editMode) {
            if (editMode) {
                return $http.put(url + $scope.user.id, user)
                        .then(function (response) {
                            console.log(response);
                            if (response.data.success) {
                                growl.addSuccessMessage('Użytkownik został zaktualizowany !');
                                $state.go('users');
                            } else {
                                $scope.error = response.data.error;
                            }
                        });
            } else {
                return $http.post(url, user)
                        .then(function (response) {
                            console.log(response);
                            if (response.data.success) {
                                growl.addSuccessMessage('Użytkownik został dodany !');
                                $state.go('users');
                            } else {
                                $scope.error = response.data.error;
                            }
                        });
            }
        };

        $scope.passMismatched = function () {
            if (angular.isDefined($scope.userForm)) {
                return $scope.userForm.password_confirmation.$error.match;
            }
        };

    }]);

interMap.controller('placesController', ['$scope', '$rootScope', '$http', '$state', 'growl', function ($scope, $rootScope, $http, $state, growl) {

        var url = '/api/place/';

        $scope.getPlaces = function () {
            return $http.get(url);
        };

        $scope.removePlace = function (id) {
            return $http.delete(url + id);
        }

        $scope.getPlaces()
                .then(function (response) {
                    if (response.data.success) {
                        $scope.places = response.data.data;
                    }
                });

        $scope.remove = function ($event, id) {
            $event.stopImmediatePropagation();

            $scope.removePlace(id).
                    success(function (data) {
                        if (data.success) {
                            angular.forEach($scope.places, function (val, key) {
                                if (val.id == id) {
                                    $scope.places.splice(key, 1);
                                }
                            });
                            growl.addSuccessMessage('Uczelnia została usunięta !');
                        } else if (data.error) {
                            growl.addErrorMessage(data.error);
                        }
                    });
        };

        $scope.editPlace = function (id) {
            var params = {};
            params.placeId = id;
            $state.go('editPlace', params);
        };

        $scope.addPlace = function () {
            $state.go('newPlace');
        };

    }]);

interMap.controller('placeController', ['$scope', '$stateParams', '$rootScope', '$http', '$state', 'growl', function ($scope, $stateParams, $rootScope, $http, $state, growl) {

        if (angular.isDefined($stateParams.placeId)) {
            $scope.placeId = $stateParams.placeId;
        }

        $scope.editMode = false;
        $scope.place = {};

        var url = '/api/place/';

        if (angular.isDefined($scope.placeId)) {
            $scope.editMode = true;

            $http.get(url + $scope.placeId)
                    .then(function (response) {
                        if (response.data.success) {
                            $scope.place = response.data.place;
                            $scope.place.lat = parseFloat($scope.place.lat);
                            $scope.place.lng = parseFloat($scope.place.lng);
                        } else {
                            growl.addErrorMessage(response.data.error);
                        }
                    });
        }

        $scope.cancel = function () {
            $state.go('places');
        };

        $scope.savePlace = function (place, editMode) {
            if (editMode) {
                return $http.put(url + $scope.place.id, place)
                        .then(function (response) {
                            if (response.data.success) {
                                growl.addSuccessMessage('Uczelnia została zaktualizowana !');
                                $state.go('places');
                            } else {
                                $scope.error = response.data.error;
                            }
                        });
            } else {
                return $http.post(url, place)
                        .then(function (response) {
                            if (response.data.success) {
                                growl.addSuccessMessage('Uczelnia została dodana !');
                                $state.go('places');
                            } else {
                                $scope.error = response.data.error;
                            }
                        });
            }
        };

    }]);

interMap.controller('placesListController', ['$scope', '$rootScope', '$http', '$state', 'growl', '$uibModal', function ($scope, $rootScope, $http, $state, growl, $uibModal) {

        $scope.sortOptions = [
            {id: 'name', name: 'Nazwy'},
            {id: 'rate', name: 'Ocen'},
            {id: 'count', name: 'Ilości Ocen'},
        ];

        var url = '/api/place/';

        $scope.getPlaces = function (sortParam) {
            return $http.get(url, {params: {sort: sortParam}});
        };

        $scope.getPlaces()
                .then(function (response) {
                    if (response.data.success) {
                        $scope.places = response.data.data;
                        $scope.sort = 'name';
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

        $scope.$watch('sort', function (newVal, oldVal) {
            if (angular.isDefined(oldVal) && angular.isDefined(newVal) && newVal != oldVal) {
                $scope.getPlaces(newVal)
                        .then(function (response) {
                            if (response.data.success) {
                                $scope.places = response.data.data;
                            }
                        });
            }
        });

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
interMap.controller('geolocalisationsController', ['$scope', '$http', function ($scope, $http) {

        var url = '/api/geolocations';

        $scope.getPlaces = function (sortParam) {
            return $http.get(url);
        };


        $scope.getPlaces()
                .then(function (response) {
                    if (response.data.success) {
                        $scope.data = response.data.data;
                    }
                });

        $scope.getCoordinates = function () {
            var getUrl = '/api/geolocations/get-coordinates';

            $http.get(getUrl)
                    .then(function (response) {
                        if (response.data.success) {
                            $scope.getPlaces()
                                    .then(function (response) {
                                        if (response.data.success) {
                                            $scope.data = response.data.data;
                                        }
                                    });
                        }
                    });
        }

    }]);

//# sourceMappingURL=controllers.js.map
