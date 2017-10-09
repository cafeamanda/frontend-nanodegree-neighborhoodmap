// /**
//  * Initializes map in a default location. Recalculates
//  * map on a new location
//  * @method initialize
//  * @param {object} center
//  *
//  */
// function init() {
//
//     // Defines a default center for the map
//     var center = new google.maps.LatLng('-22.9492586', '-43.1545757');
//
//     // Creates a new map object
//     var map = new google.maps.Map(document.getElementsByClassName('map')[0], {});
//
//     // Adds an Autocomplete functionality to
//     // '#choose-neighborhood' input box
//     var input = document.getElementById('chooseNeighborhood');
//     var zoomAutocomplete = new google.maps.places.Autocomplete(input);
//     zoomAutocomplete.bindTo('bounds', map);
//
//     // On form.submit, changes neighborhood and recalculates map
//     var $form = $('#locationForm');
//     $form.submit(function (e) {
//         // Prevents page from refreshing on submit
//         e.preventDefault();
//
//         // Gets the chosen neighborhood
//         var neighborhood = $('#chooseNeighborhood').val();
//
//         // Geocodes address to get LatLng
//         var geocoder = new google.maps.Geocoder();
//         geocoder.geocode({
//             "address": neighborhood
//         }, function (result, status) {
//             if (status === "OK") {
//                 center = result[0].geometry.location;
//                 $('.places-list').empty();
//                 initMap(map, center);
//             } else {
//                 alert("Error: " + status +
//                     "\nTry again.");
//             }
//         });
//
//     });
//     initMap(map, center);
// }
//
// /**
//  *
//  * @method initMap
//  * @param {object} center
//  *
//  */
// function initMap(map, center) {
//
//     // Creates a new map
//     map = new google.maps.Map(document.getElementsByClassName('map')[0], {
//         center: center,
//         zoom: 14
//     });
//
//     // Load services
//     var placesService = new google.maps.places.PlacesService(map);
//
//     /**
//      * Finds places of interest in the neighborhood.
//      * Google Maps Javascript Places API accepts only
//      * up to 20 requests/sec for free, so the result
//      * will contain up to 20 places.
//      */
//     placesService.textSearch({
//             location: center,
//             radius: 2500,
//             type: "natural_feature"
//         },
//         function (results, status) {
//             if (status == google.maps.places.PlacesServiceStatus.OK) {
//                 console.log(results);
//                 for (var i = 0; i < results.length; i++) {
//                     addPlace(results[i]);
//                 }
//             } else {
//                 console.error(status);
//             }
//         }
//     );
//
//     /**
//      * Adds a marker on the map and a new item on places-list
//      * @method addPlace
//      * @param {object} place
//      */
//     var markers = [];
//
//     function addPlace(place) {
//         var marker = createMarker(place);
//         marker.setMap(map);
//         markers.push(marker);
//         // $('.places-list')
//         //     .append("<li id='" + marker.id + "' class='place-item' role='button'>" + marker.title + "</li>");
//         // $('.place-item')
//         //     .click(function (e) {
//         //         if (e.target.getAttribute("id") == marker.id) {
//         //             new google.maps.event.trigger(markers[marker.id], 'click');
//         //         } else {
//         //             return;
//         //         }
//         //     });
//
//     }
//
//     // Load StreetView service
//     var streetViewService = new google.maps.StreetViewService();
//     /**
//      * Gets the street view of a location
//      * @method getStreetView
//      * @param {object} marker
//      * @return {object} Promise
//      */
//     function getStreetView(marker) {
//         return new Promise(function (resolve, reject) {
//             streetViewService.getPanoramaByLocation(marker.position, 50, function (result, status) {
//                 if (status !== google.maps.places.PlacesServiceStatus.OK) {
//                     reject(result);
//                 } else {
//                     resolve(result);
//                 }
//             });
//         });
//     }
//
//     /**
//      * Gets details of a place on the app
//      * @method getPlaceDetails
//      * @param {object} place
//      * @return {object} Promise
//      */
//     function getPlaceDetails(place) {
//         return new Promise(function (resolve, reject) {
//             placesService.getDetails(place, function (result, status) {
//                 if (status !== google.maps.places.PlacesServiceStatus.OK) {
//                     reject(result);
//                 } else {
//                     resolve(result);
//                 }
//             });
//         });
//     };
//
//     /**
//      * Creates a marker
//      * @method createMarker
//      * @param {object} place
//      * @return {object} marker
//      */
//     var markerId = 0;
//
//     function createMarker(place) {
//         // Creates new marker object
//         var marker = new google.maps.Marker({
//             map: map,
//             position: place.geometry.location,
//             title: place.name,
//             id: markerId
//         });
//
//         var infowindow = createInfoWindow(marker);
//
//         // Adds an event listener for clicks on the marker:
//         // Animates marker with BOUNCE and opens an infowindow,
//         // Makes a call for populateInfoWindow(),
//         // Opens infowindow,
//         // Centers map on marker's position
//         marker.addListener('click', function () {
//             this.setAnimation(google.maps.Animation.BOUNCE);
//             populateInfoWindow(place, marker, infowindow);
//             infowindow.open(map, marker);
//             map.setCenter(marker.position);
//         });
//
//         // Stops animation on map.click
//         google.maps.event.addListener(map, 'click', function () {
//             marker.setAnimation(null);
//         });
//
//         markerId++;
//         return marker;
//     }
//
//     /**
//      * Creates an infowindow
//      * @method createInfoWindow
//      * @param {object} marker
//      */
//     function createInfoWindow(marker) {
//         var infowindow = new google.maps.InfoWindow();
//
//         // Makes sure infowindow is assigned to marker
//         if (infowindow.marker != marker) {
//             infowindow.setContent('');
//             infowindow.marker = marker;
//             infowindow.addListener('closeclick', function () {
//                 infowindow.marker = null;
//             });
//         }
//
//         // Closes infowindow on map.click
//         google.maps.event.addListener(map, 'click', function () {
//             infowindow.close();
//         });
//
//         return infowindow;
//     }
//
//     /**
//      * Populates an infowindow
//      * @method populateInfoWindow
//      * @param {object} place
//      * @param {object} marker
//      * @return {object} infowindow
//      */
//     function populateInfoWindow(place, marker, infowindow) {
//
//         // Defines HTML to display a picture of the place if there's any available
//         // If not, displays message to let user know there isn't any
//         var photoHTML = "";
//         if (place.photos) {
//             photoHTML = '<figure>' +
//                 '<img class="place-img" src="' + place.photos[0].getUrl({
//                     'maxHeight': 100
//                 }) + '">' +
//                 '<figcaption class="place-img_caption">' +
//                 '<i class="fa fa-camera"></i> ' + place.photos[0].html_attributions +
//                 '</figcaption>' +
//                 '</figure>';
//         } else {
//             photoHTML = '<p class="place_data-feedback">No photos available.</p>';
//         }
//
//         // Awaits for a Promise and populates infowindow on arrival
//         getPlaceDetails(place)
//             .then(function (details) {
//                 infowindow.setContent(
//                     '<div class="place-details">' +
//                     '<p class="place-name">' + place.name + '</p>' +
//                     '<a href="' + details.url + '" target="_blank">' +
//                     '<p class="place-address">' + place.formatted_address + '</p>' +
//                     '</a>' +
//                     photoHTML +
//                     '<p class="place-rating"><i class="fa fa-star place-rating_icon"></i> ' + place.rating + '</p>' +
//                     '</div>'
//                 );
//             })
//             .catch(function (error) {
//                 console.log(error)
//             });
//     }
//
// };
