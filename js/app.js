
/*var model = {
  houses: [
    {
      id: 1,
      address: '3/106 Wellington Street, Bondi Beach, NSW 2026',
      coords: {
        lat: -33.888981,
        lng: 151.265723
      },
      fav: true
    },
    {
      id: 2,
      address: '1 Birriga Road, Bellevue Hill, NSW 2023',
      coords: {
        lat: -33.886791,
        lng: 151.264967
      },
      fav: true
    },
    {
      id: 3,
      address: "39 O'Brien Street, Bondi Beach NSW 2026",
      coords: {
        lat: -33.888772,
        lng: 151.269315
      },
      fav: false
    },
    {
      id: 4,
      address: '68 Lamrock Avenue, Bondi Beach NSW 2026',
      coords: {
        lat: -33.890324,
        lng: 151.269081
      },
      fav: false
    },
    {
      id: 5,
      address: '161 Glenayr Avenue, Bondi Beach NSW 2026',
      coords: {
        lat: -33.888121,
        lng: 151.271426
      },
      fav: false
    }
  ],
  updatingHouses: function(house){
    house.fav(house.fav());
  }
}*/

var model = {
  houses: [],
  getData: function(){
    //empty the data
    model.houses = [];
    var urlapi = 'http://api2.agentaccount.com:80/properties.json';
    var found = false;
    var address;
    $.ajax({
      method: 'GET',
      url: urlapi,
      data: { 'token':'827f01934ab7e1f007eda5b79141aa28f6623d61', 'postcode': '2022', 'property_type': 'house'},
      dataType: 'json',
      //Tha ajax call is synchronous to get firstly the data and populate the arrays
      async: false
    }).then(function(data){
      var arrayData = data.results;
      for(var i=0;i < arrayData.length;i++){
        if(model.houses.length === 0){
          model.houses.push(arrayData[i]);
        }
        //looking for repeated values to not add them to the model
        for(var x=0;x < model.houses.length;x++){
          //remove trailing and double spaces
          var dataStreetName = arrayData[i].address.street_name.replace("  ", " ").trim();
          var modelStreetName = model.houses[x].address.street_name.replace("  ", " ").trim();
          //compare street name and number
          if(dataStreetName === modelStreetName && arrayData[i].address.street_number === model.houses[x].address.street_number){
            found = true;
            //if found it goes out the loop
            break;
          }else{
            found = false;
          }
        }
        //if not already in the array it is added
        if(!found){
          model.houses.push(arrayData[i]);
        }
      }
    }).fail(function(){
        alert('There has been an error retrieving the data.');
    });
  },
  updatingHouses: function(house){
    house.fav(house.fav());
  },
  //getLocation: function(address){
  getLocation: function(address, objAddress, callback){
    /*geocoder.geocode({'address': address}, function(results, status) {
      if (status === google.maps.GeocoderStatus.OK) {
        return results[0].geometry.location;
      } else {
        alert('Geocode was not successful for the following reason: ' + status);
      }
    });*/
    var geoURL = 'https://maps.googleapis.com/maps/api/geocode/json';
    //return $.ajax(geoURL, {dataType: 'json', data: {'address': address, 'key': 'AIzaSyC4dYdTtAuclPLAGpEg-1UQ947LrilnwkI'}});
    $.ajax({
      method: 'GET',
      url: geoURL,
      dataType: 'json',
      data: {'address': address, 'key': 'AIzaSyC4dYdTtAuclPLAGpEg-1UQ947LrilnwkI'}
    }).done(function(data){
        callback(data.results[0].geometry.location);
    }).error(function(error){
        alert('Geocode was not successful.' + error.statusText);
    });
  }
}

var House = function(data){
  this.id = data.id;
  this.address = data.address.street_number+" "+data.address.street_name + ", "+ data.address.postcode+" "+data.address.suburb;
  this.coords = { 'lat': data.address.latitude, 'lng': data.address.longitude};
  this.bedrooms = data.bedrooms;
  this.bathrooms = data.bathrooms;
  this.description = data.description;
  this.ensuite = data.ensuite;
  this.photos = data.photos;
  this.price = data.price;
  this.fav = ko.observable(false);
}

//Create an observable array to used in view and not access directly to model
var ViewModel = {
  init: function() {
      var self = this;
      //getting the data
      model.getData();

      this.houseArray = ko.observableArray([]);
      model.houses.forEach(function(house){
          self.houseArray.push(new House(house));
      });
      //Updating the model and the array used in view
      this.updatingfavourites = function(){
        model.updatingHouses(this);
        ViewModel.arrayUpdated(self.houseArray());
        view.updateMarker(this);
        return true;
      }
  },
  arrayUpdated: function(){
    var self = this;
    this.houseArray = ko.observableArray([]);
    model.houses.forEach(function(house){
      self.houseArray.push(new House(house));
    });
    return this.houseArray();
  },
  getData: function(address, lat, lon){
  /*  function createCORSRequest(method, url) {
      var xhr = new XMLHttpRequest();
      if ("withCredentials" in xhr) {

        // Check if the XMLHttpRequest object has a "withCredentials" property.
        // "withCredentials" only exists on XMLHTTPRequest2 objects.
        xhr.open(method, url, true);

      } else if (typeof XDomainRequest != "undefined") {

        // Otherwise, check if XDomainRequest.
        // XDomainRequest only exists in IE, and is IE's way of making CORS requests.
        xhr = new XDomainRequest();
        xhr.open(method, url);

      } else {

        // Otherwise, CORS is not supported by the browser.
        xhr = null;

      }
      return xhr;
    }
    function makeCorsRequest() {
      // This is a sample server that supports CORS.
      var url = 'http://api.walkscore.com/score?format=json&address='+address+'&lat='+lat+'&lon='+lon+'&wsapikey=64469e224e3cc31a438fcc5d36c82a7a';

      var xhr = createCORSRequest('GET', url);
      xhr.setRequestHeader('Access-Control-Allow-Origin','*');
      if (!xhr) {
        alert('CORS not supported');
        return;
      }else{
          console.log(xhr);
      }

      // Response handlers.
      xhr.onload = function() {
        var text = xhr.responseText;
        alert('Response from CORS request to ' + url);
      };

      xhr.onerror = function() {
        alert('Woops, there was an error making the request.');
      };

      xhr.send();
    }
    makeCorsRequest();*/
    /*$.ajaxSetup({
      beforeSend: function(xhr){
        xhr.setRequestHeader('Access-Control-Allow-Origin','*')
      }
    });*/
    /*$.ajax({
        method: 'GET',
        url: 'http://api.walkscore.com/score',
        contentType: 'text/plain',
        dataType: "json",
        data: {'format': 'json', 'address': address, 'lat':lat, 'lon': lon, 'wsapikey':'64469e224e3cc31a438fcc5d36c82a7a'}
    }).done(function(response){
        console.log(response);
        $('.infowindow').find('p').append(response);
    }).error(function(){
        $('#walk').append("There has been an error retrieving the data. Please, try again in few minutes.");
    });*/

    /*var urlWiki = "https://en.wikipedia.org/w/api.php?action=opensearch&search=" + place +"&format=json&?callback=?wrapResults";

    $.ajax({
        url: urlWiki,
        dataType: "jsonp"
    }).done(function(response){
        var wikiResult = response[0];
        console.log(response + " " +response[1]);
        $('.infowindow').find('p').append(wikiResult);
    });
      /*var d = new Date();
      var n = d.getTime();
      var generateNonce = function(length) {
              var text = "";
              var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
              for(var i = 0; i < length; i++) {
                  text += possible.charAt(Math.floor(Math.random() * possible.length));
              }
              return text;
      }
      var parameters  = "oauth_consumer_key=BCMdeLpDldTwwutIU-mtMQ, oauth_token=Tl3vwFxDDw7gdpC9YLViS1VX_sElszwB, oauth_nonce=" + generateNonce(15)+ ", oauth_timestamp=" + n +", oauth_signature_method=HMAC-SHA1, oauth_version=1.0,";
      var parameterString  = "oauth_consumer_key=BCMdeLpDldTwwutIU-mtMQ&oauth_token=Tl3vwFxDDw7gdpC9YLViS1VX_sElszwB&oauth_nonce=" + generateNonce(15)+ "&oauth_timestamp=" + n +"&oauth_signature_method=HMAC-SHA1&oauth_version=1.0";
      var urlapi = 'https://api.yelp.com/v3/businesses/search';
      var consumerSecret = 'zLdJC9-4MomQWJbLlsQb9lHgoeE';
      var tokenSecret = 'QmWaJw9YXc6eINNdLKNiLqNZDIw';
      var signature = oauthSignature.generate('GET', urlapi, parameterString, consumerSecret, tokenSecret, { encodeSignature: false});
console.log(signature);
      var all = urlapi+'?'+parameterString+'&oauth_signature='+signature;

      $.ajaxSetup({
        beforeSend: function(xhr) {
            //xhr.setRequestHeader('Access-Control-Allow-Origin',true);
            xhr.setRequestHeader('Authorization', parameters+" oauth_signature="+signature);
        }
      });
    $.ajax({
      method: 'GET',
      url: urlapi,
      dataType: 'json',
      data: 'term=school&location=Bondi&cll=-33.890955,151.277420',
      headers: {'Access-Control-Allow-Origin':'*'},
      success: function(data){
        console.log(data);
      },
      error: function(e){
        console.log(e);
      }
    });

  //  });*/
    var urlapi = 'http://api2.agentaccount.com:80/properties.json'

    $.ajax({
      method: 'GET',
      url: urlapi,
      data: { 'token':'827f01934ab7e1f007eda5b79141aa28f6623d61', 'postcode': '2026', 'suburb': 'Bondi', 'property_type': 'house'},
      dataType: 'json',
      success: function(data, statusText){
        console.log(data.results);
      },
      error: function(error){
        console.log(error);
      }
    });
  },
  getServices: function(service){
    if (document.getElementById(service).checked) {
      var places = new google.maps.places.PlacesService(map);
      var latlng = {lat: map.getCenter().lat(), lng: map.getCenter().lng()};
      var request = {
        location: latlng,
        radius: '1000',
        types: [service]
      };
      places.nearbySearch(request, function(results, status){
        if (status == google.maps.places.PlacesServiceStatus.OK) {
          view.showServicesMarkers(results, service);
        }else if(status == google.maps.places.PlacesServiceStatus.ZERO_RESULTS){
          console.log("No results");
        }else{
          console.log("error " + status);
        }
      });
    } else {
      view.hideServicesMarkers(service);
    }
  }
};


var view = {
  map: {},
  markers: [],
  schoolMarkers: [],
  doctorMarkers: [],
  shopping_mallMarkers: [],
//Initialiasing the map
  initMap: function(){
    var self = this;
    var vaucluse = {lat: -33.857001, lng:  151.278429};
    this.map = new google.maps.Map(document.getElementById('map'), {
            center: vaucluse,
            zoom: 10,
            mapTypeControl: true,
            mapTypeControlOptions: {
                style: google.maps.MapTypeControlStyle.HORIZONTAL_BAR,
                position: google.maps.ControlPosition.TOP_RIGHT
            }
    });
    this.setMarkers();

//Adding events to elements
    var menu = document.getElementById('menu');
    var main = document.querySelector('main');
    var drawer = document.querySelector('.nav');

    menu.addEventListener('click', function(e) {
      drawer.classList.toggle('open');
      e.stopPropagation();
    });
    main.addEventListener('click', function() {
      drawer.classList.remove('open');
    });

    var schools = document.getElementById('school');
    var medical = document.getElementById('doctor');
    var markets = document.getElementById('shopping_mall');
    schools.addEventListener('change', function(){
      ViewModel.getServices('school');
    });
    medical.addEventListener('change', function(){
      ViewModel.getServices('doctor');
    });
    markets.addEventListener('change', function(){
      ViewModel.getServices('shopping_mall');
    });

  },
  //create the object google.maps.Marker
  createMarker: function(map, position, title, icon, id){
    var marker = new google.maps.Marker({
      map: map,
      position: position,
      title: title,
      animation: google.maps.Animation.DROP,
      icon: icon,
      id: id
    });
    return marker;
  },
  //setting the model markers
  setMarkers: function(){
    var self = this;
    var marker;
    var bounds = new google.maps.LatLngBounds();
    var locations = ViewModel.arrayUpdated();
    console.log(locations);
    //var geocoder = new google.maps.Geocoder();
    for (var i = 0; i < locations.length; i++) {

      /*var coords = geocoder.geocode({'address': locations[i].address}, function(results, status) {
        if (status === google.maps.GeocoderStatus.OK) {
          return results[0].geometry.location;
        } else {
          alert('Geocode was not successful for the following reason: ' + status);
        }
      });*/

      //depending on fav attribute the marker icon is different
      if(locations[i].fav()){
        self.marker = self.createMarker(view.map,locations[i].coords, locations[i].address,'images/star-3.png', locations[i].id);
      }else{
        self.marker = self.createMarker(view.map,locations[i].coords, locations[i].address,'images/home-2.png', locations[i].id);
      }

      view.markers.push(self.marker);

      //adding infowindow to markers
      var infowindow = new google.maps.InfoWindow();
      //closure to update the request to the api
      self.marker.addListener('click', (function(copyLocations){
        return function(){
          //ViewModel.getData(copyLocations.address, copyLocations.coords.lat, copyLocations.coords.lng);
          self.setInfoWindows(this, infowindow, null);
        }
      })(locations[i]));

    }
  //adding the markers to the map
    for (var i = 0; i < view.markers.length; i++) {
      view.markers[i].setMap(view.map);
      bounds.extend(view.markers[i].position);
    }
    view.map.fitBounds(bounds);
  },
  //update the marker
  updateMarker: function(house){
    var self = this;
    //Select the marker of the selected house (The houses' ids go from 1 to 5 and the array from 0 to 4, so -1)
    var indexSelected;
    for (var i = 0; i < view.markers.length; i++) {
      if(view.markers[i].id === house.id){
        indexSelected = i;
        break;
      }
    }
    var markerSelected = view.markers[indexSelected];
    //delete the marker from the map
    markerSelected.setMap(null);
    //remove the marker from the markers array
    view.markers.splice(indexSelected, 1);
    markerSelected = null;

    if(house.fav()){
      //create the new marker
      marker = this.createMarker(view.map,house.coords,house.address,'images/star-3.png', house.id);

      //add the marker to the markers array in the correct position to match the house.id -1
      view.markers.splice(indexSelected, 0, marker);
    }else{
      marker = this.createMarker(view.map,house.coords,house.address,'images/home-2.png', house.id);
      //add the marker to the markers array in the correct position to match the house.id -1
      view.markers.splice(indexSelected, 0, marker);
    }
    var infowindow = new google.maps.InfoWindow();

    //closure to update the request to the api
    marker.addListener('click', (function(copyHouse){
      return function(){
        //ViewModel.getData(copyHouse.address, copyHouse.coords.lat, copyHouse.coords.lng);
        self.setInfoWindows(this, infowindow, null);
      }
    })(house));
  },
  //Creating the infowindow
  setInfoWindows: function(marker, infowindow, service){
    //checking if the infowindow already exists for this marker
    if (infowindow.marker != marker) {
      infowindow.open(view.map, marker);
    }
    //removing previous content
    infowindow.setContent('');
    infowindow.marker = marker;
    infowindow.addListener('closeclick', function(){
      infowindow.marker = null;
    });
    this.setInfowindowContent(infowindow, marker, service);
  },
  //adding content to infowindows
  setInfowindowContent: function(infowindow, marker, service){
    var streetview = 'https://maps.googleapis.com/maps/api/streetview?location=' + marker.title + '&key=AIzaSyC4dYdTtAuclPLAGpEg-1UQ947LrilnwkI&size=200x200';
    var content = '<div class="infowindow"><img class="bgimg" src="' + streetview + '"><span>'+ marker.title +'</span></div><div id="walk"></div>';

    //adding content to infowindow
    infowindow.setContent(content);
  },
  //showing the services markers
  showServicesMarkers: function(results, service){

    for (var i = 0; i < results.length; i++) {
      var title = results[i].name + " " + results[i].vicinity;
      var name = results[i].name;
      marker = this.createMarker(view.map,results[i].geometry.location, title, 'images/' + service + '.png', i);

      if(service === 'school'){
        view.schoolMarkers.push(marker);
      }else if (service === 'doctor') {
        view.doctorMarkers.push(marker);
      }else{
        view.shopping_mallMarkers.push(marker);
      }
      var infowindow = new google.maps.InfoWindow();
      marker.addListener('click', function(){
        view.setInfoWindows(this, infowindow, service);
      });
    }
  },
  //hiding the services markers
  hideServicesMarkers: function(service){
    if(service === 'school' && view.schoolMarkers.length > 0){
      for (var i = 0; i < view.schoolMarkers.length; i++) {
        view.schoolMarkers[i].setMap(null);
      }
      view.schoolMarkers = [];
    }else if (service === 'doctor' && view.doctorMarkers.length > 0) {
      for (var i = 0; i < view.doctorMarkers.length; i++) {
        view.doctorMarkers[i].setMap(null);
      }
      view.doctorMarkers = [];
    }else{
      for (var i = 0; i < view.shopping_mallMarkers.length; i++) {
        view.shopping_mallMarkers[i].setMap(null);
      }
      view.shopping_mallMarkers = [];
    }
  }
}

ko.applyBindings(new ViewModel.init());
