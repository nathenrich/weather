var weatherApp = angular.module('weatherApp', ['weatherApp.service'])
  .run(function($rootScope) {
});

angular.module('weatherApp.service',[]).
  factory('WeatherDataSource', ['$http',function($http){
    return {
      get: function(callback, latlong, time){
        if(time){
          time = "," + time;
        }else{
          time = "";
        }
        $http.get(
          "weather_data/" + latlong.latitude + "," + latlong.longitude + time + "?exclude=minutely,alerts,flags"
        ).success(function(data, status) {
          callback(data);
        })
      }
    }
  }]
);

weatherApp.controller('mainController', function($scope, $http, WeatherDataSource){
  $scope.loadingMsg           = "loading current location...";
  $scope.latlong              = {"latitude": null, "longitude": null}
  $scope.date                 = new Date();
  $scope.weatherData          = null;
  $scope.hourlyData           = null;
  $scope.today                = null;
  $scope.locationSearchString = null;
  $scope.locationTitle        = null;
  $scope.map                  = null;

  errorMsg = function(vlu) {
    $scope.loadingMsg = vlu;
  }

  init = function(){
    if (navigator.geolocation) {
       navigator.geolocation.getCurrentPosition(function(position){
         $scope.loadingMsg = "loading weather data...";
         setCurrentLatLng(position.coords.latitude, position.coords.longitude);
         WeatherDataSource.get(setForecastData, $scope.latlong);
         revearseGeocode($scope.latlong);
      });
    } else {
      $scope.loadingMsg = "Geolocation is not supported by this browser.";
    }
  }

  setCurrentLatLng = function(latitude, longitude) {
    $scope.latlong.latitude = latitude;
    $scope.latlong.longitude = longitude;
  }

  setForecastData = function(data) {
    $scope.weatherData = data;
    $scope.hourlyData = data.hourly;
    $scope.today = $scope.dayText(data.currently.time);
    loadMap($scope.latlong);
  }

  setDayData = function(data) {
    $scope.hourlyData = data.hourly;
  }

  revearseGeocode = function(latlong) {
    var geocoder =  new google.maps.Geocoder();
    var point = new google.maps.LatLng(latlong.latitude, latlong.longitude);
    geocoder.geocode({ 'latLng': point }, function (results, status) {
      if (status == google.maps.GeocoderStatus.OK) {
        $scope.locationTitle = (results[0].address_components[3].long_name + ", " + results[0].address_components[5].short_name);
      }
    });
  }

  loadMap = function(latlong){
    $scope.map = new google.maps.Map(document.getElementById("googleMap"), {
      center:new google.maps.LatLng(latlong.latitude, latlong.longitude),
      zoom:7,
      disableDefaultUI: true,
      styles: [{"featureType":"administrative","elementType":"all","stylers":[{"visibility":"off"}]},{"featureType":"administrative","elementType":"geometry.stroke","stylers":[{"visibility":"on"}]},{"featureType":"administrative","elementType":"labels","stylers":[{"visibility":"on"},{"color":"#716464"},{"weight":"0.01"}]},{"featureType":"administrative.country","elementType":"labels","stylers":[{"visibility":"on"}]},{"featureType":"landscape","elementType":"all","stylers":[{"visibility":"simplified"}]},{"featureType":"landscape.natural","elementType":"geometry","stylers":[{"visibility":"simplified"}]},{"featureType":"landscape.natural.landcover","elementType":"geometry","stylers":[{"visibility":"simplified"}]},{"featureType":"poi","elementType":"all","stylers":[{"visibility":"simplified"}]},{"featureType":"poi","elementType":"geometry.fill","stylers":[{"visibility":"simplified"}]},{"featureType":"poi","elementType":"geometry.stroke","stylers":[{"visibility":"simplified"}]},{"featureType":"poi","elementType":"labels.text","stylers":[{"visibility":"simplified"}]},{"featureType":"poi","elementType":"labels.text.fill","stylers":[{"visibility":"simplified"}]},{"featureType":"poi","elementType":"labels.text.stroke","stylers":[{"visibility":"simplified"}]},{"featureType":"poi.attraction","elementType":"geometry","stylers":[{"visibility":"on"}]},{"featureType":"road","elementType":"all","stylers":[{"visibility":"on"}]},{"featureType":"road.highway","elementType":"all","stylers":[{"visibility":"off"}]},{"featureType":"road.highway","elementType":"geometry","stylers":[{"visibility":"on"}]},{"featureType":"road.highway","elementType":"geometry.fill","stylers":[{"visibility":"on"}]},{"featureType":"road.highway","elementType":"geometry.stroke","stylers":[{"visibility":"simplified"},{"color":"#a05519"},{"saturation":"-13"}]},{"featureType":"road.local","elementType":"all","stylers":[{"visibility":"on"}]},{"featureType":"transit","elementType":"all","stylers":[{"visibility":"simplified"}]},{"featureType":"transit","elementType":"geometry","stylers":[{"visibility":"simplified"}]},{"featureType":"transit.station","elementType":"geometry","stylers":[{"visibility":"on"}]},{"featureType":"water","elementType":"all","stylers":[{"visibility":"simplified"},{"color":"#84afa3"},{"lightness":52}]},{"featureType":"water","elementType":"geometry","stylers":[{"visibility":"on"}]},{"featureType":"water","elementType":"geometry.fill","stylers":[{"visibility":"on"}]}]
    });
  }

  $scope.dayText = function(timestamp){
    var days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
    return days[new Date(timestamp*1000).getDay()];
  }

  $scope.sellectDay = function(timestamp) {
    $scope.today = $scope.dayText(timestamp);
    WeatherDataSource.get(setDayData, $scope.latlong, timestamp);
  }

  $scope.locationSearch = function() {
    var geocoder =  new google.maps.Geocoder();
    geocoder.geocode( { 'address': $scope.locationSearchString}, function(results, status) {
      if (status == google.maps.GeocoderStatus.OK) {
        setCurrentLatLng(results[0].geometry.location.lat(), results[0].geometry.location.lng())
        WeatherDataSource.get(setForecastData, $scope.latlong);
        revearseGeocode($scope.latlong);
      } else {
        console.error("Something is wrong " + status);
      }
    });
  }

  init();
});
