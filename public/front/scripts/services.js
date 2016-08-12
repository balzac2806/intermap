interMap.service('interMapAPI', [], function () {

});


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
interMap.factory('LocalizationMapService', ['$rootScope', '$timeout', '$filter', 'MapService', function ($rootScope, $timeout, $filter, MapService) {

    var drawnItems;
    var _getIconClass = function (className) {
        return '<i class="li-fw ' + className + '"></i> ';
    };
    var _getLocationTooltip = function (text, type) {
        var label = '';
        switch (type) {
            case 'visits':
                label = _getIconClass('li-users') + text;
                break;
            case 'time_spent':
                label = _getIconClass('li-clock') + $filter('humanizeTime')(text, 'seconds');
                break;
            case 'new':
                label = _getIconClass('li-users-new') + text;
                break;
            case 'unique':
                label = _getIconClass('li-users-unique') + text;
                break;
            case 'returning':
                label = _getIconClass('li-users-return') + text;
                break;
            default:
                label = '';
        }

        return label;
    };
    var LocalizationMapService = {
        map: null,
        MAP_MIN_HEIGHT: 500,
        MAP_VERT_MARGIN: 60,
        defaultZoom: 6,
        maxZoom: 18,
        defaultLat: 52.2333,
        defaultLng: 21.0167,
        circleDrawer: null,
        newLayers: null,
        initMap: function (mapElementId, latLng, zoom) {
            mapElementId = typeof mapElementId !== 'undefined' ? mapElementId : 'map';
            latLng = typeof latLng !== 'undefined' ? latLng : [this.defaultLat, this.defaultLng];
            zoom = typeof zoom !== 'undefined' ? zoom : this.defaultZoom;
            this.map = L.map(mapElementId);
            // Update leaflet map height
            this.resizeAfterLoad(mapElementId);
            this.map.addLayer(new L.TileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'));
            this.changeView(latLng[0], latLng[1], zoom);
            // Initialise the FeatureGroup to store editable layers
            drawnItems = new L.FeatureGroup();
            this.map.addLayer(drawnItems);
            this.map.on('draw:created', function (e) {
                $rootScope.$broadcast('elementDrawn', {layer: e.layer, type: e.layerType});
            });
            $timeout(function () {
                this.getMap().invalidateSize();
            }.bind(this), 0);
        },
        /**
         * Wyświetlenie innej części mapy
         * @param float lat
         * @param float lng
         * @param int zoom
         */
        changeView: function (lat, lng, zoom) {
            if (typeof zoom === 'undefined')
                zoom = this.maxZoom;
            if (typeof lat === 'undefined')
                lat = this.defaultLat;
            if (typeof lng === 'undefined')
                lng = this.defaultLng;
            this.map.setView(new L.LatLng(lat, lng), zoom);
        },
        zoomByRadius: function (radius) {
            if (radius < 100)
                return this.maxZoom;
            if (radius < 1000)
                return 15;
            if (radius < 10000)
                return 11;
            if (radius < 30000)
                return 9;
            return this.defaultZoom;
        },
        /**
         * This is mostly to fix angular and leaflet issues
         * invalidateSize on resize
         */
        resizeAfterLoad: function (mapElementId) {
            var isSupportedBrowser = !(navigator.userAgent.indexOf('MSIE') !== -1 || navigator.appVersion.indexOf('Trident/') > 0);
            if (isSupportedBrowser) {
                this.map.on('resize', function () {
                    var newMapHeight = $(window).height() - $('#header').height() - this.MAP_VERT_MARGIN;
                    $('#' + mapElementId).height(newMapHeight > this.MAP_MIN_HEIGHT ? newMapHeight : this.MAP_MIN_HEIGHT);
                    this.map.invalidateSize();
                }.bind(this));
            }

            $rootScope.$on('updateMaps', function () {
                $timeout(function () {
                    window.dispatchEvent(new Event('resize'));
                });
            });
        },
        /**
         * Zwraca mapę leafleta
         */
        getMap: function () {
            return this.map;
        },
        /**
         * Rysuje koło dla lokalizacji i kieruje na odpowiednie współrzędne
         * @param localization
         */
        displayLocalization: function (localization) {
            localization.point_lat_lng = [localization.lat, localization.lng];
            var circle = L.circle(localization.point_lat_lng, localization.radius);
            circle.off('click').on('click', function () {
                $rootScope.$broadcast('elementEdit', localization);
            });
            circle.addTo(this.map);
            return circle;
        },
        /**
         * Rysuje koła dla tablicy lokalizacji
         * @param array localizations
         * @param bool editEnabled
         */
        displayLocalizations: function (localizations, editEnabled) {
            localizations.forEach(function (localization) {
                localization.point_lat_lng = [localization.lat, localization.lng];
                var circle = L.circle(localization.point_lat_lng, localization.radius);
                if (editEnabled) {
                    circle.off('click').on('click', function () {
                        $rootScope.$broadcast('elementEdit', localization);
                    });
                }

                // Tooltips For Localizations
                var popup = new L.Popup();
                popup.setContent('<p><b>' + localization.name + '</b>');
                circle.bindPopup(popup, {autoPan: true, closeButton: false});
                circle.on('mouseover', function (e) {
                    this.openPopup();
                });
//                    circle.on('mouseout', function (e) {
//                        this.closePopup();
//                    });

                circle.addTo(this.map);
                localization._leaflet_id = circle._leaflet_id;
            }.bind(this));
            return localizations;
        },
        /**
         * Czyści mapę z lokalizacji
         */
        clearMap: function () {
            for (var i in this.map._layers) {
                if (this.map._layers[i]._path != undefined) {
                    try {
                        this.map.removeLayer(this.map._layers[i]);
                    } catch (e) {
                        //console.log("problem with " + e + this.map._layers[i]);
                    }
                }
            }
        },
        /**
         * Usuwa element z mapy
         * @param layerId
         */
        removeElement: function (layerId) {
            this.map.eachLayer(function (layer) {
                if (layer._leaflet_id === layerId) {
                    this.map.removeLayer(layer);
                }
            }.bind(this));
        },
        /**
         * Odpala rysowanie okręgu - lokalizacji
         */
        enableLocalizationSelector: function () {
            this.circleDrawer = new L.Draw.Circle(this.map, {});
            this.circleDrawer.enable();
        },
        /**
         * Kończy rysowanie okręgu - lokalizacji
         */
        disableLocalizationSelector: function () {
            if (!angular.isNullOrUndefined(this.circleDrawer)) {
                this.circleDrawer.disable();
            }
        },
        /**
         * Przerywa rysowanie elementu
         */
        cancelElement: function () {
            if (!angular.isNullOrUndefined(this.circleDrawer)) {
                this.circleDrawer.disable();
            }
            if (!angular.isNullOrUndefined(this.newLayers)) {
                this.newLayers.eachLayer(function (layer) {
                    this.map.removeLayer(layer);
                });
                this.newLayers = null;
            }
        },
        addLayer: function (layer, additionalLayer) {
            this.map.addLayer(layer);
            drawnItems.addLayer(additionalLayer ? additionalLayer : layer);
        },
        showLocations: function (locations, type) {
            LocalizationMapService.clearMap();
//                LocalizationMapService.displayLocalizations(locations, true);

            var markers = new L.MarkerClusterGroup({
                iconCreateFunction: function (cluster) {
                    var nodes = cluster.getAllChildMarkers(),
                            amount = 0,
                            count = 0;
                    angular.forEach(nodes, function (node) {
                        var location = node.options.location_data;
                        if (angular.isDefined(location)) {
                            amount = amount + location[type];
                            count = count + 1;
                        }
                    });
                    if (type === 'time_spent') {
                        amount = amount / count;
                        amount = $filter('humanizeTime')(amount, 'seconds');
                        amount = amount.replace(" ", "&nbsp;");
                    }

                    return new L.DivIcon({
                        html: '<div><span>' + amount + '</span></div>',
                        className: 'marker-cluster marker-cluster-small',
                        iconSize: new L.Point(40, 40)
                    });
                }
            });
            var newMapWidth = this.map._size.x / 10;
            var maxValue = 0;
            var heatMapData = [];
            var cfg = {
                radius: 1,
                maxOpacity: .3,
                scaleRadius: false,
                latField: 'lat',
                lngField: 'lng',
                valueField: 'value',
//                    useLocalExtrema: true
            };
            var heatmapLayer = new HeatmapOverlay(cfg);
            this.addLayer(heatmapLayer);
            angular.forEach(locations, function (location) {
                var latLng = {
                    lat: location.point_lat_lng[0],
                    lng: location.point_lat_lng[1]
                };
                var locationMarker = new L.Marker(latLng, {icon: MapService.createMarkerIcon('location'), location_data: location}),
                        popup = new L.Popup(),
                        popupContent = '',
                        data = location[type];
                if (angular.isDefined(data)) {
                    popupContent = _getLocationTooltip(data, type);
                    // Heat map
                    maxValue = (data > maxValue) ? data : maxValue;
                    if (data > 0) {
                        heatMapData.push(angular.extend({}, latLng, {value: data, radius: location.radius}));
                    }
                }

                popup.setContent('<p><b>' + location.name + '</b><br/>' + popupContent + '</p>');
                locationMarker.bindPopup(popup, {autoPan: false});
                locationMarker.on('click', function () {
                    this.openPopup();
                });
                markers.addLayer(locationMarker);
            });
            heatmapLayer.setData({max: maxValue, data: heatMapData});
            LocalizationMapService.addLayer(markers);
        }
    };
    return LocalizationMapService;
}]);
//# sourceMappingURL=services.js.map
