# Udacity Neighborhood Map
The goal of this project is to create a website using Google Maps and services, a 3rd party API, as well as the use of the knowledge acquired during the course like Ajax or Knockout.

##Description
The site pretends to be a guide for a house buyer looking for a house in a neighborhood in Sydney, Australia. It displays a list of houses on the map, allowing the user to select his favorite ones and to show some of the nearby services like schools, medical services, beaches and supermarkets.

###Code
The code is written based in Knockout MVVM pattern, being separated in 3 modules:

- model: the main data that populate the app. The data are hardcoded, displaying a list of properties.
- ViewModel: the controller that manages the operations between the model and the view using Knockout observables to filter the locations and update the data when is required (Favourite property)
- view: where the DOM is managed and the data are displayed to the user

##Services used
The site is built using **Google Maps, Google Places, Google StreetView** and **Foursquare** as 3rd party API.

##Libraries used
- Knockout
- Bootstrap
- JQuery

## How it works
- When the user loads the page a list of properties are displayed on the panel and the Google map. The user can click on the list of properties and on the markers, and the infowindow is opened showing the information about the selected house.
- The user can select one house as **favourite** clicking on the checkbox that appears beside the address of the house's list. The marker of the house is automatically update with **Knockout**
- The user can as well **filter** the list of properties introducing a text to be searched for. The list and the map will be updated with **Knockout**
- The user can show and hide different services clicking on the checkboxes at the end on the list of properties and open the correspondent infowindow clicking on its marker. These locations are provided by **Google Places** and **Foursquare** in case of the beaches.
- The infowindows can be closed clicking on the 'x' button or with the `esc key`.

##3rd party API FOURSQUARE
The application is getting data from **FOURSQUARE** for displaying the nearby services to each house on the correspondent infowindow and the locations of the nearby beaches showing their names, addresses and URLs when they are available.

##URL Demo
https://anbegaral.github.io/project5/

##Installation
As the project is a website, installation is not required, the user can click on the previous link to display it or copy this repository to a local server (IIS, Tomcat, etc) pointing to `index.html` in `dist` directory and open it on a browser.

## Minifying code
The javascript and css code have been minified using **Gulp** tasks.
