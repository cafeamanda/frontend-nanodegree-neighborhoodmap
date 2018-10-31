function initialize() {

    // Defines a default center for the map
    var center = new google.maps.LatLng('40.758895', '-73.985131');

    // Creates a new map object
    var map = new google.maps.Map(document.getElementsByClassName('map')[0], {
        center: center,
        zoom: 13
    });

    // Loads places service
    var placesService = new google.maps.places.PlacesService(map);

    // This is the declaration of the model, to be populated
    var googleData = [];

    /**
     * This method gets places by textSearch, using the
     * Places Services
     * @method getPlacesByTextSearch
     * @return {object} Promise
     */
    function getPlacesByTextSearch() {
        return new Promise(function (resolve, reject) {
            placesService.textSearch({
                location: center,
                radius: 2500,
                types: ["museum"]
            }, function (result, status) {
                if (status !== google.maps.places.PlacesServiceStatus.OK) {
                    reject(result);
                } else {
                    resolve(result);
                }
            });
        });
    }

    /**
     * This block of code receives and deals with the Promise
     * returned by getPlacesByTextSearch(). Once the model is
     * done getting populated, the knockout.js bindings
     * are activated to reflect the search on the map and
     * the list view.
     */
    getPlacesByTextSearch()
        .then(function (results) {
            for (var i = 0; i < results.length; i++) {
                googleData.push(results[i]);
            }
            // Activates knockout.js
            ko.applyBindings(new ViewModel());
        })
        .catch(function (error) {
            alert("An error occured: " + error);
        });

    /**
     * Gets details of a place on the app
     * @method getPlaceDetails
     * @param {object} place
     * @return {object} Promise
     */
    function getPlaceDetails(place) {
        return new Promise(function (resolve, reject) {
            placesService.getDetails(place, function (result, status) {
                if (status !== google.maps.places.PlacesServiceStatus.OK) {
                    reject(result);
                } else {
                    resolve(result);
                }
            });
        });
    }

    /**
     * Creates a marker on the map, with animation on click
     * @method createMarker
     * @param {object} place
     * @return {object} marker
     */
    var markers = []; // Markers array to keep track of all the markers on the map
    function CreateMarker(place) {
        var marker = new google.maps.Marker({
            map: map,
            position: place.geometry.location,
            title: place.name
        });

        var infowindow = createInfoWindow(marker);

        marker.addListener('click', function () {
            google.maps.event.trigger(map, 'click'); // closes any open infowindows
            this.setAnimation(google.maps.Animation.BOUNCE); // sets animation to 'Bounce'
            populateInfoWindow(place, marker, infowindow); // populates infowindow
            infowindow.open(map, marker); // opens correspondent infowindow
            map.setCenter(marker.position); // recenters map on selected marker
        });

        // Stops animation on map.click
        google.maps.event.addListener(map, 'click', function () {
            marker.setAnimation(null);
        });

        markers.push(marker);

        marker.setMap(map);

        return marker;
    }

    /**
     * Removes all existing markers
     * @method removeAllMarkers
     */
    function removeAllMarkers() {
        for (var i = 0; i < markers.length; i++) {
            markers[i].setMap(null);
        }
    }

    /**
     * Creates an infowindow
     * @method createInfoWindow
     * @param {object} marker
     */
    function createInfoWindow(marker) {
        var infowindow = new google.maps.InfoWindow();

        // Makes sure infowindow is assigned to marker
        if (infowindow.marker != marker) {
            infowindow.setContent('');
            infowindow.marker = marker;
            infowindow.addListener('closeclick', function () {
                infowindow.marker = null;
            });
        }

        // Closes infowindow on map.click
        google.maps.event.addListener(map, 'click', function () {
            infowindow.close();
        });

        return infowindow;
    }

    /**
     * Populates an infowindow
     * @method populateInfoWindow
     * @param {object} place
     * @param {object} marker
     * @return {object} infowindow
     */
    function populateInfoWindow(place, marker, infowindow) {

        // Defines HTML to display a picture of the place if there's any available
        // If not, displays message to let user know there isn't any
        var photoHTML = "";
        if (place.photos) {
            photoHTML = '<figure>' +
                '<img class="place-img" src="' + place.photos[0].getUrl({
                    'maxHeight': 100
                }) + '">' +
                '<figcaption class="place-img_caption">' +
                '<i class="fa fa-camera"></i> ' + place.photos[0].html_attributions +
                '</figcaption>' +
                '</figure>';
        } else {
            photoHTML = '<p class="place_data-feedback">No photos available.</p>';
        }

        /**
         * This block of code receives and deals with the Promise
         * returned by getPlaceDetails(). Once the response arrives,
         * it makes an ajax request to get data from the MediaWiki API
         * and populates an infowindow with the information from both
         * requests.
         */
        getPlaceDetails(place)
            .then(function (details) {

                // MediaWiki API request
                var wikiUrl = "https://en.wikipedia.org/w/api.php?action=opensearch&search='" + place.name + "'&format=json&callback=wikiCallBack";
                $.ajax({
                    url: wikiUrl,
                    dataType: "jsonp",
                    success: function (response) {
                        var wikiHTML = "";

                        if (response[1].length > 0) {
                            var wikiList = response[1];
                            var wikiUrls = response[3];

                            for (var i = 0; i < wikiList.length; i++) {
                                wikiHTML += "<li><a href='" + wikiUrls[i] + "' target='_blank'>&bull; " + wikiList[i] + "</a></li>";
                            }
                        } else {
                            wikiHTML = "<p>No articles found</p>";
                        }

                        // Sets a content for the infowindow
                        infowindow.setContent(
                            '<div class="place-details">' +
                            '<p class="place-name">' + place.name + '</p>' +
                            '<a href="' + details.url + '" target="_blank">' +
                            '<p class="place-address">' + place.formatted_address + '</p>' +
                            '</a>' +
                            photoHTML +
                            '<section class="wiki-articles">' +
                            '<h5>Related articles</h5>' +
                            '<ul class="wiki-articles__list">' +
                            wikiHTML +
                            '</ul>' +
                            '<p><small><small>Powered by Wikipedia</small></small></p>' +
                            '</section>' +
                            // '<p class="place-rating"><i class="fa fa-star place-rating_icon"></i> ' + place.rating + '</p>'
                            '</div>'
                        );
                    },
                    error: function (err) {
                        alert("An error occured: " + err);
                    }
                });
            })
            .catch(function (error) {
                alert("An error occured: " + error);
            });
    }


    // This is the Knockout ViewModel,
    // with its instances and methods
    function ViewModel() {

        var self = this;

        self.places = ko.observableArray();

        self.markers = ko.observableArray();

        self.filterValue = ko.observable("");

        self.openInfoWindow = function (index) {
            // trigger map click to close any open infowindows
            google.maps.event.trigger(map, 'click');
            // open correspondent infowindow
            google.maps.event.trigger(self.markers()[index], 'click');
        };

        self.initialSearch = function () {
            self.places.removeAll();
            self.markers.removeAll();
            removeAllMarkers();
            for (var i = 0; i < googleData.length; i++) {
                self.places.push(googleData[i]);
                self.markers.push(new CreateMarker(googleData[i]));
            }
        };

        self.searchFilter = function () {
            self.places.removeAll();
            self.markers.removeAll();
            removeAllMarkers();
            for (var i = 0; i < googleData.length; i++) {
                if (googleData[i].name.toLowerCase().includes(self.filterValue().toLowerCase())) {
                    self.places.push(googleData[i]);
                    self.markers.push(new CreateMarker(googleData[i]));
                }
            }
        };

        self.worker = ko.computed(function () {
            if (self.filterValue()) self.searchFilter();
            else if (!self.filterValue()) self.initialSearch();
        }, this);

    }
}

function mapError() {
    alert("Google Maps API was unable to load. Please try again later.");
}
