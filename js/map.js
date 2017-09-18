function initMap() {

    // Declares and defines a center to the map
    var center = new google.maps.LatLng('-22.9492586', '-43.1545757');

    // Creates a new map
    var map = new google.maps.Map(document.getElementsByClassName('map')[0], {
        center: center,
        zoom: 14
    });

    // Stores the list in sidemenu into a variable
    // to uptade it later
    var $placesList = $('.places-list')[0].innerHTML;

    /* Finds places of interest in the neighborhood
     * (!)  Google Maps Javascript Places API accepts
     *      only up to 20 requests/sec for free, so
     *      the result will contain up to 20 places.
     */
    var service = new google.maps.places.PlacesService(map);
    service.textSearch({
            location: center,
            radius: 2500,
            type: "natural_feature"
        },
        function (results, status) {
            if (status == google.maps.places.PlacesServiceStatus.OK) {
                console.log(results);
                for (var i = 0; i < results.length; i++) {
                    addPlace(results[i]);
                }
                // Updates the sidemenu's places list
                $('.places-list')[0].innerHTML = $placesList;

            } else {
                console.error(status);
            }
        }
    );

    /**
     * StreetView ->
     * place?
     * heading: east ? west
     * pitch: up ? down
     */


    /**
     * Adds a marker and a link for a place on the map
     * @method addPlace
     * @param {object} place
     */
    function addPlace(place) {

        // Adds place to sidemenu's list
        var placeHTML = '<li class="place"><a class="place-link">' + place.name + '</a></li>';

        $placesList += placeHTML;

        // Creates marker
        var marker = createMarker(place);

        // Place marker on the map
        marker.setMap(map);

        // Adds an event listener for clicks on the markers,
        // Animates markers with BOUNCE,
        // Opens an infowindow for this marker,
        // Terminates marker animation after ~2 seconds
        marker.addListener('click', function () {
            this.setAnimation(google.maps.Animation.BOUNCE);
            populateInfoWindow(place, marker);
        });
    }

    /**
     * Gets details of a place on the app
     * @method getDetails
     * @param {object} details
     * @param {object} place
     */
    function getPlaceDetails(details, place) {
        service.getDetails(place, function(result, status) {
            if (status !== google.maps.places.PlacesServiceStatus.OK) {
                console.error(status);
                return;
            } else {
                details = JSON.stringify($.extend(true, details, result));
            }
        });
    }

    /**
     * Creates a marker
     * @method createMarker
     * @param {object} place
     * @return {object} marker
     */
    function createMarker(place) {
        // Creates new marker object
        var marker = new google.maps.Marker({
            map: map,
            position: place.geometry.location,
            title: place.name
        });

        // Stops animation in all markers on map.click
        google.maps.event.addListener(map, 'click', function() {
            marker.setAnimation(null);
        });

        return marker;
    }

    /**
     * Creates and populates an infowindow
     * @method populateInfoWindow
     * @param {object} place
     * @param {object} marker
     * @return {object} infowindow
     */
    function populateInfoWindow(place, marker) {

        // Creates new InfoWindow object
        var infowindow = new google.maps.InfoWindow();

        var placeDetails = {};
        getPlaceDetails(placeDetails, place);

        // Uses setTimeout to deal with async requests
        // Sets infowindow content
        setTimeout(function() {
            infowindow.setContent(
                '<div class="place-details">'
                + '<p class="place-name">' + place.name + '</p>'
                + '<a href="' + placeDetails.url + '" target="_blank">'
                + '<p class="place-address">' + place.formatted_address + '</p>'
                + '</a>'
                + '<p class="place-rating"><i class="fa fa-star place-rating_icon"></i> ' + place.rating + '</p>'
                + '</div>'
            );
        }, 100);


        // Assigns InfoWindow to marker
        infowindow.open(map, marker);

        // Closes all infowindows on map.click
        google.maps.event.addListener(map, 'click', function() {
            infowindow.close();
        });
    }

};
