var weatherApp = angular.module('weatherApp', ['weatherApp.service'])
  .directive('weatherGraph', function() {
    function link(scope, element, attrs) {
      var width = element[0].width;
      var height = element[0].height;
      var labelTxtY = 90;
      var ctx = element[0].getContext('2d');

      init = function(){
        ctx.font = "12px Arial";
        ctx.fillText("midnight", 10, labelTxtY);
        ctx.fillText("noon", (width / 2) - 30, labelTxtY);
        ctx.fillText("midnight", width - 60, labelTxtY);
        ctx.beginPath();
        ctx.moveTo(10,labelTxtY - 10);
        ctx.lineTo(width - 10,labelTxtY - 10);
        ctx.stroke();
      }

      temperatureToY = function(temperature){
        var useableHeight = height - 20;
        var incrementHeight = (useableHeight / 120);
        return useableHeight - (temperature * incrementHeight) - 10;
      }

      scope.$watch('hourlyData', function () {
        if(scope.hourlyData){
          ctx.clearRect(0, 0, 800, 100);
          init();
          var temperatureList = scope.hourlyData.data;
          ctx.beginPath();
          ctx.strokeStyle = '#ff0000';
          ctx.moveTo(10,temperatureToY(temperatureList[0]));
          for(i=1; i < temperatureList.length; i++){
            var x = ((width - 10) / 24) * i;
            var y = temperatureToY(temperatureList[i].temperature);
            ctx.lineTo(x, y);
            ctx.stroke();
          }
          ctx.beginPath();
          ctx.strokeStyle = '#0000ff';
          ctx.moveTo(10,temperatureToY(temperatureList[0]));
          for(i=1; i < temperatureList.length; i++){
            var x = ((width - 10) / 24) * i;
            var y = temperatureToY(temperatureList[i].precipProbability * 25);
            ctx.lineTo(x, y);
            ctx.stroke();
          }
        }
      });

    }return {
      restrict: 'E',
    	replace: true,
    	scope: true,
    	link: link,
    	template: '<canvas id="weather-graph" width="800" height="100" class="graph"></canvas>'
    };
  }).run(function($rootScope) {
});

angular.module('weatherApp.service',[]).
  factory('WeatherDataSource', ['$http',function($http){
    return {
      get: function(callback, lat, lon, time){
        if(time){
          time = "," + time;
        }else{
          time = "";
        }
        $http.get(
          "https://api.forecast.io/forecast/30fe5b10284534a271f479dfcff6b614/"+lat+","+lon+time+"?exclude=minutely,alerts,flags"
        ).success(function(data, status) {
          callback(data);
        })
      }
    }
  }]
);

weatherApp.controller('mainController', function($scope, $http, WeatherDataSource){
  $scope.loadingMsg = "loading current location...";
  $scope.map = { center: { latitude: 45, longitude: -73 }, zoom: 8 };
  $scope.currentLatitude = null;
  $scope.currentLongitude = null;
  $scope.weatherData = null;
  $scope.today = null;
  $scope.hourlyData = null;
  $scope.locationSearchString = null;

  init = function(){
    if (navigator.geolocation) {
       navigator.geolocation.getCurrentPosition(function(position){
         $scope.loadingMsg = "loading weather data...";
         $scope.currentLatitude = position.coords.latitude
         $scope.currentLongitude = position.coords.longitude
         WeatherDataSource.get(setData, $scope.currentLatitude, $scope.currentLongitude);
         console.log("location : " + $scope.currentLatitude + " " + $scope.currentLongitude);
      });
    } else {
      $scope.loadingMsg = "Geolocation is not supported by this browser.";
    }
  }

  setData = function(data) {
    $scope.weatherData = data;
    $scope.hourlyData = data.hourly;
    $scope.today = $scope.dayText(data.currently.time);
  }

  setDayData = function(data) {
    $scope.hourlyData = data.hourly;
  }

  $scope.dayText = function(timestamp){
    var days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
    return days[new Date(timestamp*1000).getDay()];
  }

  $scope.timeText = function(timestamp){
    return new Date(timestamp*1000);
  }

  $scope.sellectDay = function(timestamp) {
    $scope.today = $scope.dayText(timestamp);
    WeatherDataSource.get(setDayData, $scope.currentLatitude, $scope.currentLongitude, timestamp);
  }

  $scope.locationSearch = function() {
    var geocoder =  new google.maps.Geocoder();
    geocoder.geocode( { 'address': $scope.locationSearchString}, function(results, status) {
      if (status == google.maps.GeocoderStatus.OK) {
        console.log("location : " + results[0].geometry.location.lat() + " " + results[0].geometry.location.lng());
        $scope.currentLatitude = results[0].geometry.location.lat();
        $scope.currentLongitude = results[0].geometry.location.lng();
        WeatherDataSource.get(setData, $scope.currentLatitude, $scope.currentLongitude);
        var point = new google.maps.LatLng($scope.currentLatitude, $scope.currentLongitude);
        geocoder.geocode({ 'latLng': point }, function (results, status) {
          if (status == google.maps.GeocoderStatus.OK) {
            console.log(results);
            var address = (results[0].address_components[3].long_name + ", " + results[0].address_components[5].short_name);
            console.log(results[0]);
            $scope.locationSearchString = address;
          }
        });
      } else {
        console.log("Something got wrong " + status);
      }
    });
  }

  init();
});
