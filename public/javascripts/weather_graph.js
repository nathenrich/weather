weatherApp.directive('weatherGraph', function() {
  function link(scope, element, attrs) {
    var width = element[0].width;
    var height = element[0].height;
    var labelTxtY = 140;
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
        ctx.clearRect(0, 0, 800, 150);
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
    template: '<canvas id="weather-graph"></canvas>'
  };
})
