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
  }
}

var House = function(data){
  this.id = data.id;
  this.address = data.address.street_number+" "+data.address.street_name + ", "+ data.address.postcode+" "+data.address.suburb+" "+data.address.state;
  this.coords = { 'lat': data.address.latitude, 'lng': data.address.longitude};
  this.lat = data.address.latitude;
  this.lng = data.address.longitude;
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
  //getting the location of the requested service
  getServices: function(service){
    if (document.getElementById(service).checked) {
      var places = new google.maps.places.PlacesService(view.map);
      var latlng = {lat: view.map.getCenter().lat(), lng: view.map.getCenter().lng()};
      var request = {
        location: latlng,
        radius: '1000',
        types: [service]
      };
      places.nearbySearch(request, function(results, status){
        if (status == google.maps.places.PlacesServiceStatus.OK) {
          view.showServicesMarkers(results, service);
        }else if(status == google.maps.places.PlacesServiceStatus.ZERO_RESULTS){
          alert("No results");
        }else{
          alert("There was an error " + status);
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
    var center = {lat: -33.892850, lng: 151.249918};
    this.map = new google.maps.Map(document.getElementById('map'), {
            center: center,
            zoom: 12,
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
    //Gathering the data from ViewModel
    var locations = ViewModel.arrayUpdated();
    for (var i = 0; i < locations.length; i++) {

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
          self.setInfoWindows(this, infowindow, copyLocations, null);
        }
      })(locations[i]));
    }
  //adding the markers to the map
    for (var i = 0; i < view.markers.length; i++) {
      view.markers[i].setMap(view.map);
      bounds.extend(view.markers[i].position);
    }
    //Centering the map to the markers
    view.map.fitBounds(bounds);
  },
  //update the marker
  updateMarker: function(house){
    var self = this;
    //Select the marker of the selected house
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
      marker = this.createMarker(view.map,house.coords,house.address,'images/star-3.png', house.id);
      //add the marker to the markers array in the correct position
      view.markers.splice(indexSelected, 0, marker);
    }else{
      marker = this.createMarker(view.map,house.coords,house.address,'images/home-2.png', house.id);
      //add the marker to the markers array in the correct position
      view.markers.splice(indexSelected, 0, marker);
    }
    var infowindow = new google.maps.InfoWindow();

    //closure to update the request to the api
    marker.addListener('click', (function(copyHouse){
      return function(){
        self.setInfoWindows(this, infowindow, copyHouse, null);
      }
    })(house));
  },
  //Creating the infowindow
  setInfoWindows: function(marker, infowindow, house, service){

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

    var content;
    if(house){
      var streetview = 'https://www.google.com/maps/embed/v1/streetview?location=' + house.lat + ',' + house.lng +'&key=AIzaSyC4dYdTtAuclPLAGpEg-1UQ947LrilnwkI';
      $('.infowindow .bgimg').attr('src', house.photos[1].versions.thumb.url);
      $('.infowindow h2').html(house.address);
      $('.bed').html('Bedrooms: ' + house.bedrooms);
      $('.bath').html('Bathrooms: ' + house.bathrooms);
      $('.ensuite').html('Ensuite: ' + house.ensuite);
      $('.price').html('Price: $' + house.price);
      $('.description').html(house.description);
      $('.street').html('<iframe class="view" width="400" height="250" frameborder="0" style="border:0" src="" allowfullscreen></iframe>');
      $('.view').attr('src', streetview);
      content = $('.infowindow').html();
    }else{
      var streetview = 'https://maps.googleapis.com/maps/api/streetview?location=' + marker.title + '&key=AIzaSyC4dYdTtAuclPLAGpEg-1UQ947LrilnwkI&size=200x200';
      $('.infowindowservice .bgimg').attr('src', streetview);
      $('.infowindowservice h2').html(marker.title);
      content = $('.infowindowservice').html();
    }
    //adding content to infowindow
    infowindow.setContent(content);

  },
  //hiding the markers
  hideInfowindows: function(){
      for (var i = 0; i < view.markers.length; i++) {
        view.markers[i].close(null);
      }
      view.markers = [];
  },
  //showing the services markers
  showServicesMarkers: function(results, service){

    for (var i = 0; i < results.length; i++) {
      var title = results[i].name + String.fromCharCode(13) + results[i].vicinity;
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
        view.setInfoWindows(this, infowindow, null, service);
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
