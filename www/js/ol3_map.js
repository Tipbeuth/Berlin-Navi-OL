/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

var map = new ol.Map({
                target: 'map',
                layers: [
                    new ol.layer.Tile({
                        source: new ol.source.OSM()
                    })
                ],
                view: new ol.View({
                    center: [1492738, 6894976],
                    zoom: 13
                }),
                controls: ol.control.defaults({
                    attributionOptions: {
                        collapsible: true
                    }
                })
            });

            var params = {
                LAYERS: 'berlin-routing:berlin-routing',
                FORMAT: 'image/png'
            };

            // The "start" and "destination" features.
            var startPoint = new ol.Feature();
            var destPoint = new ol.Feature();

            // The vector layer used to display the "start" and "destination" features.
            var vectorLayer = new ol.layer.Vector({
                source: new ol.source.Vector({
                    features: [startPoint, destPoint]
                })
            });
            map.addLayer(vectorLayer);

            // A transform function to convert coordinates from EPSG:3857
            // to EPSG:4326.
            var transform = ol.proj.getTransform('EPSG:3857', 'EPSG:4326');

            // Register a map click listener.
            map.on('click', function (event) {
                if (startPoint.getGeometry() == null) {
                    // First click.
                    startPoint.setGeometry(new ol.geom.Point(event.coordinate));
                } else if (destPoint.getGeometry() == null) {
                    // Second click.
                    destPoint.setGeometry(new ol.geom.Point(event.coordinate));
                    // Transform the coordinates from the map projection (EPSG:3857)
                    // to the server projection (EPSG:4326).
                    var startCoord = transform(startPoint.getGeometry().getCoordinates());
                    var destCoord = transform(destPoint.getGeometry().getCoordinates());
                    var viewparams = [
                        'x1:' + startCoord[0], 'y1:' + startCoord[1],
                        'x2:' + destCoord[0], 'y2:' + destCoord[1]
                    ];
                    params.viewparams = viewparams.join(';');
                    result = new ol.layer.Image({
                        source: new ol.source.ImageWMS({
                            url: 'http://gistribution.de:8080/geoserver/berlin-routing/wms',
                            params: params
                        })
                    });
                    map.addLayer(result);
                }
            });

            var clearButton = document.getElementById('clear');
            clearButton.addEventListener('click', function (event) {
                // Reset the "start" and "destination" features.
                startPoint.setGeometry(null);
                destPoint.setGeometry(null);
                // Remove the result layer.
                map.removeLayer(result);
            });