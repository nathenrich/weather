weatherApp.directive('weatherGraph', function() {
  function link(scope, element, attrs) {
    var width = element[0].width;
    var height = element[0].height;
    var bottomMargin = 30;
    var rightMargin = 30;
    var leftMargin = 30;
    var bottomTextOffset = 15;
    var hourSize = ((width - leftMargin - rightMargin) / 24)
    var ctx = element[0].getContext('2d');

    init = function(){
      // time lables
      ctx.fillStyle = '#000000';
      ctx.font = "12px Arial";
      ctx.fillText("midnight", leftMargin, height - bottomMargin + bottomTextOffset);
      ctx.fillText("noon", (width / 2) - ctx.measureText("noon").width, height - bottomMargin + bottomTextOffset);
      ctx.fillText("midnight", width - rightMargin - ctx.measureText("midnight").width, height - bottomMargin + bottomTextOffset);
      // temp lables
      ctx.font = "11px Arial";
      ctx.fillStyle = '#CF5300;';
      ctx.fillText("120°", 2, 10);
      ctx.fillText("60°", 9, (height - bottomMargin) / 2);
      ctx.fillText("0°", 16, height - bottomMargin);
      // rain lables
      ctx.fillStyle = '#0000ff';
      ctx.fillText("100%", width - rightMargin + 3, 10);
      ctx.fillText("50%", width - rightMargin + 3, (height - bottomMargin) / 2);
      ctx.fillText("0%", width - rightMargin + 3, height - bottomMargin);
      // box outline
      ctx.strokeStyle = '#000000';
      ctx.beginPath();
      ctx.moveTo(leftMargin, height - bottomMargin);
      ctx.lineTo(width - rightMargin, height - bottomMargin);
      ctx.stroke();
      ctx.lineTo(width - rightMargin, 0);
      ctx.stroke();
      ctx.lineTo(leftMargin, 0);
      ctx.stroke();
      ctx.lineTo(leftMargin, height - bottomMargin);
      ctx.stroke();
    }

    temperatureToY = function(temperature){
      var useableHeight = height - bottomMargin;
      var incrementHeight = (useableHeight / 120);
      return useableHeight - (temperature * incrementHeight);
    }

    rainToY = function(temperature){
      var useableHeight = height - bottomMargin;
      var incrementHeight = (useableHeight / 100);
      return useableHeight - (temperature * incrementHeight) - 2;
    }

    // redraw on new hourlyData
    scope.$watch('hourlyData', function () {
      if(scope.hourlyData){
        ctx.clearRect(0, 0, 800, 150);
        init();
        var temperatureList = scope.hourlyData.data;
        ctx.beginPath();
        ctx.strokeStyle = '#CF5300';
        ctx.moveTo(leftMargin, temperatureToY(temperatureList[0]));
        for(i=1; i < temperatureList.length; i++){
          var x = leftMargin + hourSize * i;
          var y = temperatureToY(temperatureList[i].temperature);
          ctx.lineTo(x, y);
          ctx.stroke();
        }
        ctx.beginPath();
        ctx.strokeStyle = '#0000ff';
        ctx.moveTo(leftMargin, temperatureToY(temperatureList[0]));
        for(i=1; i < temperatureList.length; i++){
          var x = leftMargin + hourSize * i;
          var y = rainToY(temperatureList[i].precipProbability * 100);
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
