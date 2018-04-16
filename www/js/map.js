var map, infoWindow;
var initMap = function () {
    map = new google.maps.Map(document.getElementById('map'), {
        center: { lat: 5.5913754, lng: -0.2497701 },
        zoom: 8
    });
    var kmlLayer = new google.maps.KmlLayer("https://maps.google.ca/maps/ms?ie=UTF8&msa=0&output=kml&msid=210000746142049190989.0004ce14b7a8e95167602", { map: map, preserveViewport: true });
    kmlLayer.setMap(map);


    infoWindow = new google.maps.InfoWindow;

    // Try HTML5 geolocation.
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function (position) {
            var pos = {
                lat: position.coords.latitude,
                lng: position.coords.longitude
            };

            infoWindow.setPosition(pos);
            infoWindow.setContent('Location found.');
            //infoWindow.open(map);
            map.setCenter(pos);

            // places search
            var service = new google.maps.places.PlacesService(map);
            service.nearbySearch({
                location: pos,
                radius: 500,
                type: ['police']
            }, callback);

            //places details


        }, function () {
            handleLocationError(true, infoWindow, map.getCenter());
        });
    } else {
        // Browser doesn't support Geolocation
        handleLocationError(false, infoWindow, map.getCenter());
    }
}
console.log('Got here');
google.maps.event.addDomListener(window, 'load', initMap());


function handleLocationError(browserHasGeolocation, infoWindow, pos) {
    infoWindow.setPosition(pos);
    infoWindow.setContent(browserHasGeolocation ?
        'Error: The Geolocation service failed.' :
        'Error: Your browser doesn\'t support geolocation.');
    infoWindow.open(map);
}

function callback(results, status) {
    if (status === google.maps.places.PlacesServiceStatus.OK) {
        for (var i = 0; i < results.length; i++) {
            createMarker(results[i]);
        }
    }
}

function createMarker(place) {
    var infowindow = new google.maps.InfoWindow;
    var placeLoc = place.geometry.location;
    var marker = new google.maps.Marker({
        map: map,
        position: place.geometry.location
    });

    google.maps.event.addListener(marker, 'click', function () {
        infowindow.setContent(place.name);
        infowindow.open(map, this);
    });
}