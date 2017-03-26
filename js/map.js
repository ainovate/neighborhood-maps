var map;

var markers = [];

//Error info for the google maps.
var mapTimeout = setTimeout(function() {
    alert("Unable to connect to Google maps");
    $('#map').append('<h1>Sorry! The winter is coming!</h1>');
}, 5000);

function initMap() {
    var hongkong = {
        lat: 22.2979,
        lng: 114.1689
    };
    map = new google.maps.Map(document.getElementById('map'), {
        center: hongkong,
        zoom: 13

    });

    clearTimeout(mapTimeout);

    //Store the lat&lng in locArray.
    var num = placeInfo.length;
    var locArray = [];
    for (var i = 0; i < num; i++) {
        var placeTitle = placeInfo[i].name;
        var obj = {
            title: placeInfo[i].name,
            location: {
                lat: placeInfo[i].lat,
                lng: placeInfo[i].lng
            }
        };
        locArray.push(obj);
    }

    var largeInfowindow = new google.maps.InfoWindow();

    var locNum = locArray.length;
    for (var i = 0; i < locNum; i++) {
        var position = locArray[i].location;
        var title = locArray[i].title;
        var marker = new google.maps.Marker({
            position: position,
            map: map,
            title: title,
            animation: google.maps.Animation.DROP,
            id: i
        });

        markers.push(marker);

        //Open largeInfowindow when you click the marker.
        marker.addListener('click', function() {
            populateInfoWindow(this, largeInfowindow);
            bounceMarker(this);
            markerDisplayDetails(this.id);
        });
    }

    //Filter for cheapPlaceMarker
    cheapPlaceMarker = function() {
        for (var i = 0; i < locNum; i++) {
            if (placeInfo[i].filter === 0) {
                markers[i].setMap(map);
                bounceMarker(markers[i]);
            } else {
                markers[i].setMap(null);
            }
        }
    };

    //Filter for costlyPlaceMarker.
    costlyPlaceMarker = function() {
        for (var i = 0; i < locNum; i++) {
            if (placeInfo[i].filter === 1) {
                markers[i].setMap(map);
                bounceMarker(markers[i]);
            } else {
                markers[i].setMap(null);
            }
        }
    };

    //Filter for allPlaceMarker.
    allPlaceMarker = function() {
        for (var i = 0; i < locNum; i++) {
            markers[i].setMap(map);
            bounceMarker(markers[i]);
        }
    };

    clickList = function(markerId) {
        var newMarker = markers[markerId];
        bounceMarker(newMarker);
        popInfoWindow(newMarker, largeInfowindow);
    };

    function popInfoWindow(marker, infowindow) {
        if (infowindow.marker != marker) {
            infowindow.setContent('');
            infowindow.marker = marker;
            infowindow.addListener('closeclick', function() {
                infowindow.marker = null;
            });
            var streetViewService = new google.maps.StreetViewService();
            var radius = 100;

            function getStreetView(data, status) {
                if (status == google.maps.StreetViewStatus.OK) {
                    var nearStreetViewLocation = data.location.latLng;
                    var heading = google.maps.geometry.spherical.computeHeading(
                        nearStreetViewLocation, marker.position);
                    infowindow.setContent('<div>' + marker.title + '</div><div id="pano"></div>');
                    var panoramaOptions = {
                        position: nearStreetViewLocation,
                        pov: {
                            heading: heading - 60,
                            pitch: 30
                        }
                    };
                    var panorama = new google.maps.StreetViewPanorama(
                        document.getElementById('pano'), panoramaOptions);
                } else {
                    infowindow.setContent('<div>' + marker.title + '</div>' +
                        '<div>(No Street View Found)</div>');
                }
            }
            streetViewService.getPanoramaByLocation(marker.position, radius, getStreetView);

            infowindow.open(map, marker);
        }
    }

    function bounceMarker(marker) {
        marker.setAnimation(google.maps.Animation.BOUNCE);
        stopAnimation(marker);

        function stopAnimation(marker) {
            setTimeout(function() {
                marker.setAnimation(null);
            }, 2100);
        }
    }
}

function bounceMarker(marker) {
    marker.setAnimation(google.maps.Animation.BOUNCE);
    stopAnimation(marker);

    function stopAnimation(marker) {
        setTimeout(function() {
            marker.setAnimation(null);
        }, 2100);
    }
}
