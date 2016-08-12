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