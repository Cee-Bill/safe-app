var map;
function initMap() {
  map = new google.maps.Map(document.getElementById('map'), {
    center: { lat: -34.397, lng: 150.644 },
    zoom: 8
  });
}

// $(document).on("click", "#popUpMenu", fucntion(evt) {
//   var onSuccess = function (position) {
//     var coords = position.coords;
//     var map = new google.maps.Map(document.getElementById('map'), { center: new google.maps.LatLng(coords.latitude, coords.longitude),zoom: 5, mapTypeId:google.maps.TypeId.ROADMAP });
//     var marker = new google.maps.Marker({ position: new google.maps.LatLng(coords.latitude, coords.longitude) \});
//     marker.setMap(map);
//   }

//   var onError = new function (error) {
//     navigator.notification.alert("Error encountered: "error.message);

// }



// });



// var onSuccess = function (position) {
//   alert('Latitude: ' + position.coords.latitude + '\n' +
//     'Longitude: ' + position.coords.longitude + '\n' +
//     'Altitude: ' + position.coords.altitude + '\n' +
//     'Accuracy: ' + position.coords.accuracy + '\n' +
//     'Altitude Accuracy: ' + position.coords.altitudeAccuracy + '\n' +
//     'Heading: ' + position.coords.heading + '\n' +
//     'Speed: ' + position.coords.speed + '\n' +
//     'Timestamp: ' + position.timestamp + '\n');
// };

// onError Callback receives a PositionError object
//
function onError(error) {
  alert('code: ' + error.code + '\n' +
    'message: ' + error.message + '\n');
}

navigator.geolocation.getCurrentPosition(onSuccess, onError);

//setting up initial latitude and logitude
// window.lat = 37.7850;
// window.lng = -122.4383;

// function circlePoint(time) {
//   var radius = 0.01;
//   var x = Math.cos(time) * radius;
//   var y = Math.sin(time) * radius;
//   return {lat:window.lat + y, lng:window.lng + x};
// };

//moving map marker position
// var map;
// var mark;
// var initialize = function() {
//   map  = new google.maps.Map(document.getElementById('map-canvas'), {center:{lat:lat,lng:lng},zoom:12});
//   mark = new google.maps.Marker({position:{lat:lat, lng:lng}, map:map});
// };
// window.initialize = initialize;

//redraw event handler: to handle new position change
// var redraw = function(payload) {
//     lat = payload.message.lat;
//     lng = payload.message.lng;
//     map.setCenter({lat:lat, lng:lng, alt:0});
//     mark.setPosition({lat:lat, lng:lng, alt:0});
//   };

//Connecting map to PubNub
// var pnChannel = "map-channel";
// var pubnub = new PubNub({
//   publishKey:   'YOUR_PUB_KEY',
//   subscribeKey: 'YOUR_SUB_KEY'
// });
// pubnub.subscribe({channels: [pnChannel]});
// pubnub.addListener({message:redraw});

// setInterval(function() {
//     pubnub.publish({channel:pnChannel, message:circlePoint(new Date().getTime()/1000)});
//   }, 500);
