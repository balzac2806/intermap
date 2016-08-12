interMap.factory('MapService', function ($rootScope, $timeout, $q, $translate) {
    var map, drawnItems, editMode;

    var MAP_MIN_HEIGHT = 500;
    var MAP_VERT_MARGIN = 60;

    // Leaflet Locale
    L.drawLocal.draw.handlers.polyline.tooltip.start = $translate.instant('MAP.LINE_START');
    L.drawLocal.draw.handlers.polyline.tooltip.cont = $translate.instant('MAP.LINE_END');

    L.drawLocal.draw.handlers.polygon.tooltip.start = $translate.instant('MAP.AREA_START');
    L.drawLocal.draw.handlers.polygon.tooltip.cont = $translate.instant('MAP.AREA_CONT');
    L.drawLocal.draw.handlers.polygon.tooltip.end = $translate.instant('MAP.AREA_END');

    L.drawLocal.draw.handlers.marker.tooltip.start = $translate.instant('MAP.BEACON');

    L.drawLocal.edit.handlers.edit.tooltip.text = $translate.instant('MAP.MOVE_TEXT');
    L.drawLocal.edit.handlers.edit.tooltip.subtext = $translate.instant('MAP.MOVE_SUBTEXT');

    var getCurrentRatio = function (level) {
        var containerWidth = map._container.clientWidth,
                containerHeight = map._container.clientHeight,
                ratioX = containerHeight / level.map_height,
                ratioY = containerWidth / level.map_width,
                ratio = ratioY,
                newMapHeight = ratioY * level.map_height;

        // If map is higher than container height, scale it!
        if (newMapHeight > containerHeight) {
            ratio = ratioX;
        }

        return ratio;
    };

    return {
        getMap: function () {
            return map;
        },
        initMap: function (id) {
            /***  little hack starts here ***/
            L.Map = L.Map.extend({
                openPopup: function (popup) {
                    //        this.closePopup();  // just comment this
                    this._popup = popup;

                    return this.addLayer(popup).fire('popupopen', {
                        popup: this._popup
                    });
                }
            }); /***  end of hack ***/

            map = new L.Map(id, {
                crs: L.CRS.Simple,
                center: [0, 0],
                maxZoom: 2,
                fullscreenControl: true
            });

            // Initialise the FeatureGroup to store editable layers
            drawnItems = new L.FeatureGroup();
            map.addLayer(drawnItems);

            // Initialise the draw control
            var drawControl = new L.Control.Draw({
                draw: {
                    polyline: false,
                    polygon: false,
                    circle: false,
                    rectangle: false,
                    marker: false
                },
                edit: false
            });

            editMode = new L.EditToolbar.Edit(map, {
                featureGroup: drawnItems
            });

            map.addControl(drawControl);

            // Whenever something is drawn
            map.on('draw:created', function (e) {
                $rootScope.$broadcast('elementDrawn', {layer: e.layer, type: e.layerType});
            });

            map.on('draw:edited', function (e) {
                $rootScope.$broadcast('elementsEdited', e.layers);
            });

            map.invalidateSize();
            // Update leaflet map height
            var isSupportedBrowser = !(navigator.userAgent.indexOf('MSIE') !== -1 || navigator.appVersion.indexOf('Trident/') > 0);
            if (isSupportedBrowser) {
                map.on('resize', function () {
                    var newMapHeight = $(window).height() - $('#header').height() - MAP_VERT_MARGIN;
                    $('#' + id).height(newMapHeight > MAP_MIN_HEIGHT ? newMapHeight : MAP_MIN_HEIGHT);
                    map.invalidateSize();
                    map.fire('dragstart');
                    map.fire('drage');
                    map.fire('dragend');
                });
            }

            // Update Maps event - trigger 'resize' event to invalidate map size
//                $rootScope.$on('updateMaps', function () {
            $timeout(function () {
                window.dispatchEvent(new Event('resize'));
//                    });
            });

            return map;
        },
        removeMap: function () {
            if (angular.isDefined(map)) {
                map.remove();
            }
            map = undefined;
            drawnItems = undefined;
        },
        loadPlan: function (level) {
            var defer = $q.defer(),
                    MapService = this;

            MapService.resetMap();
            if (angular.isNullOrUndefined(level.map_width) || angular.isNullOrUndefined(level.map_height)) {
                defer.reject('Level plan dimensions are not defined!');
            } else {
                $timeout(function () {
                    var containerWidth = map._container.clientWidth,
                            ratio = containerWidth * level.map_height / level.map_width;
                    map.options.maxZoom = Math.round(level.map_width / containerWidth / 2) + 1;
//                        var southWest = map.unproject([0, -ratio], map.getMinZoom());
                    var northEast = map.unproject([containerWidth, 0], map.getMinZoom());
                    var southWest = map.unproject([0, -level.map_height], map.getMinZoom());
//                        var northEast = map.unproject([level.map_width, 0], map.getMinZoom());
                    var bounds = new L.LatLngBounds(southWest, northEast);

                    MapService.resetMap();
                    L.imageOverlay(level.map_path, bounds).addTo(map);

                    map.setMaxBounds(bounds);
                    map.fitBounds(bounds);

//                        MapService.fitMap();
                    MapService.onResize(level, function (newMapWidth, newMapHeight) {
                        map.options.maxZoom = Math.round(level.map_width / newMapWidth / 2) + 1;

                        var southWest = map.unproject([0, -newMapHeight], map.getMinZoom());
                        var northEast = map.unproject([newMapWidth, 0], map.getMinZoom());
                        var bounds = new L.LatLngBounds(southWest, northEast);

                        MapService.resetMap();
                        L.imageOverlay(level.map_path, bounds).addTo(map);
                        map.setMaxBounds(bounds);
                        map.fitBounds(bounds);
                    });

                    defer.resolve('Map is loaded.');
                });
            }
            return defer.promise;
        },
        resetMap: function () {
            map.eachLayer(function (layer) {
                map.removeLayer(layer);
            });
        },
        fitMap: function () {
            // Hack below, new elements are added only after browser window resize (?!)
            map._onResize();
        },
        getLayer: function (layerId) {
            var _layer;
            map.eachLayer(function (layer) {
                if (parseInt(layer._leaflet_id) === parseInt(layerId)) {
                    _layer = layer;
                }
            });
            return _layer;
        },
        addLayer: function (layer, additionalLayer) {
            map.addLayer(layer);
            drawnItems.addLayer(additionalLayer ? additionalLayer : layer);
        },
        removeLayer: function (layerId) {
            map.eachLayer(function (layer) {
                if (layer._leaflet_id === layerId) {
                    map.removeLayer(layer);
                }
            });
            drawnItems.eachLayer(function (layer) {
                if (layer._leaflet_id === layerId) {
                    drawnItems.removeLayer(layer);
                }
            });
        },
        enableEditLayersMode: function () {
            this.disableFullScreen();
            editMode.enable();
        },
        cancelEdit: function () {
            this.enableFullScreen();
            editMode.revertLayers();
            editMode.disable();
        },
        saveEditedLayers: function () {
            this.enableFullScreen();
            editMode.save();
            editMode.disable();
        },
        getLayerOptions: function (type) {
            switch (type.toLowerCase()) {
                case 'area':
                    return {color: '#ffff00'};
                case 'distance':
                    return {color: '#ff0000'};
                case 'connection':
                    return {color: '#ff0000'};
                default:
                    throw new Error('No such layer type in getLayerOptions function!');
            }
        },
        createMarkerIcon: function (type) {
            var options;
            switch (type) {
                case 'start':
                    options = {prefix: 'li', icon: 'flag-o', markerColor: 'red'};
                    break;
                case 'end':
                    options = {prefix: 'li', icon: 'flag-goal', markerColor: 'green'};
                    break;
                case 'beacon':
                    options = {prefix: 'fa', icon: 'fa-dot-circle-o', markerColor: 'blue'};
                    break;
                case 'location':
                    options = {prefix: 'li', icon: 'beacon', markerColor: 'blue'};
                    break;
                case 'beacon-selected':
                    options = {prefix: 'li', icon: 'beacon', markerColor: 'green'};
                    break;
                case 'node':
                    options = {prefix: 'li', icon: 'plus', markerColor: 'blue'};
                    break;
                case 'node-selected':
                    options = {prefix: 'li', icon: 'plus', markerColor: 'green'};
                    break;
                case 'node-1':
                    options = {prefix: 'li', icon: 'flag-goal', markerColor: 'red'};
                    break;
                case 'node-1-selected':
                    options = {prefix: 'li', icon: 'flag-goal', markerColor: 'green'};
                    break;
                case 'node-2':
                    options = {prefix: 'li', icon: 'plus', markerColor: 'blue'};
                    break;
                case 'node-2-selected':
                    options = {prefix: 'li', icon: 'plus', markerColor: 'green'};
                    break;
                case 'node-3':
                    options = {prefix: 'li', icon: 'exit', markerColor: 'blue'};
                    break;
                case 'node-3-selected':
                    options = {prefix: 'li', icon: 'exit', markerColor: 'green'};
                    break;
                case 'node-4':
                    options = {prefix: 'li', icon: 'stairs', markerColor: 'blue'};
                    break;
                case 'node-4-selected':
                    options = {prefix: 'li', icon: 'stairs', markerColor: 'green'};
                    break;
                case 'node-5':
                    options = {prefix: 'li', icon: 'elevator', markerColor: 'blue'};
                    break;
                case 'node-5-selected':
                    options = {prefix: 'li', icon: 'elevator', markerColor: 'green'};
                    break;
                default:
                    throw new Error('No such marker type in createMarkerIcon function!');
            }
            angular.extend(options, {className: 'appsoup-marker'});

            return L.AwesomeMarkers.icon(options);
        },
        enableFullScreen: function () {
            $('.leaflet-control-fullscreen').removeClass('fullscreen-disabled');
        },
        disableFullScreen: function () {
            $('.leaflet-control-fullscreen').addClass('fullscreen-disabled');
        },
        isFullscreenOn: function () {
            return map.isFullscreen();
        },
        /*
         * PROJECTION, SCALING map
         * -----------------------
         * - onResize: function that scales the map image to the specific browser resolution
         * - pointToLatLng: maps point to real LatLng (according to the real image map size)
         * - pointFromLatLng: maps real LatLng coordinates (stored in database) into scaled map displayed to user
         */
        onResize: function (level, callback) {
            map.on('resize', function () {
                $timeout(function () {
                    var containerWidth = map._container.clientWidth,
                            containerHeight = map._container.clientHeight,
                            ratioX = containerHeight / level.map_height,
                            ratioY = containerWidth / level.map_width,
                            newMapWidth = containerWidth,
                            newMapHeight = ratioY * level.map_height;


                    if (newMapHeight > containerHeight) {
                        newMapHeight = containerHeight;
                        newMapWidth = ratioX * level.map_width;
                    }

                    callback(newMapWidth, newMapHeight);
                });
            });
        },
        pointToLatLng: function (point, level) {
            var actualPoint = {},
                    ratio = getCurrentRatio(level);
            if (angular.isArray(point) && point.length > 0) {
                actualPoint = {
                    lng: parseInt(point[0] * ratio),
                    lat: parseInt(point[1] * ratio)
                };
            }
            return actualPoint;
        },
        pointFromLatLng: function (point, level) {
            var actualX, actualY,
                    ratio = getCurrentRatio(level);

            if (angular.isDefined(point) && angular.isDefined(point.lng) && angular.isDefined(point.lat)) {
                actualX = parseInt(point.lng / ratio);
                actualY = parseInt(point.lat / ratio);
            }

            return [actualX, actualY];
        }
    };
    
    return interMap;

});