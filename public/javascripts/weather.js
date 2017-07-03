var Weather = function(){
  var latlong = {};
  var weatherData = {};

  var $weatherApp = $('.w-container');

  var init = function(){
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(position){
        setCurrentLatLng(position.coords.latitude, position.coords.longitude);
        getWeaherData(done);
      });
    } else {
      console.log("Geolocation is not supported by this browser.");
    }
  }

  var getWeaherData = function(callback, time){
    if(time){
      time = "," + time;
    }else{
      time = "";
    }
    $.ajax({
      method: 'GET',
      url: 'weather_data/' + latlong.latitude + ',' + latlong.longitude + time + '?exclude=minutely,alerts,flags',
      success: function(data){
        callback(data);
      }
    });
  }

  var done = function(data){
    console.log(data)
    var dayTemplate = $('#w-day').html();
    var $days = $('#w-week');
    var dayNames = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];

    $.each(data.daily.data, function(i, day){
      day.time = dayNames[new Date(day.time * 1000).getDay()]
      $days.append(Mustache.render(dayTemplate, day));
      if (i == 4) {
        return false;
      }
    });

    $weatherApp.fadeIn();
  }

  var dayText = function(timestamp){
    var days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
    return days[new Date(timestamp*1000).getDay()];
  }

  var setCurrentLatLng = function(latitude, longitude) {
    latlong.latitude = latitude;
    latlong.longitude = longitude;
  }

  return{
    init: init
  }
};
