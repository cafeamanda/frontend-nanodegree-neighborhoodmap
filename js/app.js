function initialize() {

    // Defines a default center for the map
    var center = new google.maps.LatLng('40.782865', '-73.965355');

    // Creates a new map object
    var map = new google.maps.Map(document.getElementsByClassName('map')[0], {
        center: center,
        zoom: 13
    });

    // Load places service
    var placesService = new google.maps.places.PlacesService(map);

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
    };

    /**
     * Creates a marker
     * @method createMarker
     * @param {object} place
     * @return {object} marker
     */
    var markers = [];
    function CreateMarker(place) {
        var marker = new google.maps.Marker({
            map: map,
            position: place.geometry.location,
            title: place.name
        });

        var infowindow = createInfoWindow(marker);

        marker.addListener('click', function () {
            new google.maps.event.trigger(map, 'click'); // closes open infowindows

            this.setAnimation(google.maps.Animation.BOUNCE);
            populateInfoWindow(place, marker, infowindow);
            infowindow.open(map, marker);
            map.setCenter(marker.position);
        });

        // Stops animation on map.click
        google.maps.event.addListener(map, 'click', function () {
            marker.setAnimation(null);
        });

        markers.push(marker);

        marker.setMap(map)

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

        // Awaits for a Promise and populates infowindow on arrival
        getPlaceDetails(place)
            .then(function (details) {

                // MediaWiki API
                var wikiLink = [];
                var wikiUrl = "https://en.wikipedia.org/w/api.php?action=opensearch&search='" + place.name + "'&format=json&callback=wikiCallBack";
                $.ajax({
                    url: wikiUrl,
                    dataType: "jsonp",
                    // jsonp: "callback",
                    success: function(response) {
                        var wikiHTML = "";

                        if (response[1].length > 0) {
                            var wikiList = response[1];
                            var wikiUrls = response[3];

                            for (var i = 0; i < wikiList.length; i++) {
                                wikiHTML += "<li><a href='"+ wikiUrls[i] + "' target='_blank'>&bull; " + wikiList[i] + "</a></li>";
                            }
                        } else {
                            wikiHTML = "<p>No articles found</p>"
                        }

                        setInfowindowContent(wikiHTML);
                    }
                });

                function setInfowindowContent(wikiHTML) {
                    infowindow.setContent(
                        '<div class="place-details">'
                            + '<p class="place-name">' + place.name + '</p>'
                            + '<a href="' + details.url + '" target="_blank">'
                                + '<p class="place-address">' + place.formatted_address + '</p>'
                            + '</a>'
                            + photoHTML
                            + '<section class="wiki-articles">'
                                + '<h5>Related articles</h5>'
                                + '<ul class="wiki-articles__list">'
                                    + wikiHTML
                                + '</ul>'
                                + '<p><small><small>Powered by Wikipedia</small></small></p>'
                            + '</section>'
                            // + '<p class="place-rating"><i class="fa fa-star place-rating_icon"></i> ' + place.rating + '</p>'
                        + '</div>'
                    );
                }
            })
            .catch(function (error) {
                console.log(error)
            });
    }



    function ViewModel() {

        var self = this;

        self.places = ko.observableArray();

        self.markers = ko.observableArray();

        self.filterValue = ko.observable("");

        self.initialSearch = function() {
            placesService.textSearch(
                {
                    location: center,
                    radius: 2500,
                    type: "point_of_interest"
                },
                function (results, status) {
                    if (status == google.maps.places.PlacesServiceStatus.OK) {
                        self.places.removeAll();
                        self.markers.removeAll();
                        removeAllMarkers();
                        for (var i = 0; i < results.length; i++) {
                            self.places.push(results[i]);
                            self.markers.push(new CreateMarker(results[i]));
                        }
                    } else {
                        console.error(status);
                    }
                }
            );
        }

        self.openInfoWindow = function(index) {
            // trigger map click to close any open infowindows
            new google.maps.event.trigger(map, 'click');
            // open correspodent infowindow
            new google.maps.event.trigger(self.markers()[index], 'click');
        };

        self.worker = ko.computed(function () {
            if (self.filterValue()) self.searchFilter();
            else if (!self.filterValue()) self.initialSearch();
        }, this);

        self.searchFilter = function() {
            placesService.textSearch(
                {
                    location: center,
                    radius: 2500,
                    type: "point_of_interest"
                },
                function (results, status) {
                    if (status == google.maps.places.PlacesServiceStatus.OK) {
                        self.places.removeAll();
                        self.markers.removeAll();
                        removeAllMarkers();
                        for (var i = 0; i < results.length; i++) {
                            if (results[i].name.includes(self.filterValue())) {
                                self.places.push(results[i]);
                                self.markers.push(new CreateMarker(results[i]));
                            }
                        }
                    } else {
                        console.error(status);
                    }
                }
            );
        }
    }

    // Activates knockout.js
    ko.applyBindings(new ViewModel());
}



/*
    data-bind="click: initMap" botao

    usar data-bind


    UDACITY ADVICE::

    list view looks in the model
    search looks in the model to see what to turn on and off
    map looks in the model to see where to put the markers

    the model decides what gets populated into everything

    when search for something the markers should reflect the result of that search as well as the list view

    list and markers are set by the search function
*/
