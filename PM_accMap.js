/*  Global Variables :
 *    G : Input data (Conutry boundary , Town boundary) obj.
 *    startDateSlider / endDateSlider : Slider obj.
 *    startValue / endValue : start/end date .
 *    
 */

var G = {}; 

function PM2Color(PMValue)
{
	if( 0.0 <= PMValue && PMValue <= 11.0) return '#FFDAC8';
	else if(12.0 <= PMValue && PMValue <= 23.0) return '#FFCBB3';
	else if(24.0 <= PMValue && PMValue <= 35.0) return '#FFAD86';
	else if(36.0 <= PMValue && PMValue <= 41.0) return '#FF8F59';
	else if(42.0 <= PMValue && PMValue <= 47.0) return '#FF5809';
	else if(48.0 <= PMValue && PMValue <= 53.0) return '#D94600';
	else if(54.0 <= PMValue && PMValue <= 58.0) return '#BB3D00';
	else if(59.0 <= PMValue && PMValue <= 64.0) return '#A23400';
	else if(65.0 <= PMValue && PMValue <= 70.0) return '#842B00';
	else if(71.0 <= PMValue) return '#642100';
	else return '#FFF3EE'
}

function getPM25(town)
{
	//console.log(TargetArea);
	if(TargetArea.indexOf(town) < 0) return -1;

	  var startDate = startValue ;
    var endDate = endValue ;
    var count = endDate - startDate + 1 ;
    var pre_str = "2016-10-";
    var pm25_sum = 0.0 ;

    //console.log(town + count.toString());

    for(i = startDate ; i <= endDate ; i ++)
    {
    	var i_str = "";
    	var date = "";
    	if(i < 10)
    		i_str = "0" + i.toString() ;
    	else
    		i_str = i.toString() ;

    	date = pre_str + i_str ;

    	if( !(date in AreaAccPM25[town]))
    	{
    		count -- ;
    		continue;
    	}

    	pm25_sum += parseFloat(AreaAccPM25[town][date]);

    }

    var result = (pm25_sum / count).toFixed(0);
    //console.log(result);
    //console.log(town + result.toString());
	return result;
}

// 起始日期
/* 設定 slider值來給其他func取 */
// https://github.com/MasterMaps/d3-slider
function onStartDateChange() {
  d3.select('#acc-text-start-date').text(startDateSlider.value());
  startValue = startDateSlider.value() ;
  //startDateSlider.value(startValue);
  if(startValue > endValue)
  {

    endDateSlider.setValue(startValue);
    endValue = startValue ;
    //onEndDateChange();
  } 
  refreshCurrent();
}

// 結束日期
function onEndDateChange() {
  d3.select('#acc-text-end-date').text(endDateSlider.value());
  endValue = endDateSlider.value() ;
  //endDateSlider.value(endValue);
  if(startValue > endValue){
    startDateSlider.setValue(endValue);
    startValue = endValue;
    //onStartDateChange();
  } 
  refreshCurrent();
}


/* 處理區塊上色部分 */
// http://bl.ocks.org/mbostock/4060606 'choropleth'
function refreshMap() {
  var canvas = d3.select('#pm-canvas'),
  towns = canvas.selectAll('path.town');

  towns.transition()
    .attr('fill', function(d) {
    	//console.log(getPM25(d.properties.name));
      return PM2Color(getPM25(d.properties.name));  // 正式上色 .
    });
}

function refreshCurrent() {
  refreshMap();
 }

 
 function drawLegend() {
  // http://d3-legend.susielu.com/
  // https://github.com/susielu/d3-legend/issues/15
  // take care to prevent the legend from being scaled
  
  var ordinal = d3.scale.ordinal()
  .domain(["71","65","59","54","48","42","36","24","12","0"])
  .range(["#642100","#842B00","#A23400","#BB3D00","#D94600","#FF5809","#FF8F59","#FFAD86","#FFCBB3","#FFDAC8"]);

   d3.select('#color-legend-bar')
    .append('svg')
    .attr('id', 'color-legend')
    .attr('width','600');

  G.legendPainter = d3.legend.color()
    .cells(10)
    .scale(ordinal)
    .orient("horizontal")
    .shapeWidth(50)
    .shapePadding(0)
    .labelAlign("start")
    .ascending(true);

  /* 畫出來 */
  G.legendPainter(d3.select('#color-legend'));

}

function startDrawingMap() {

/******************* population map *******************/
  /* 取得ViewBox 長與寬 */
  var viewBox = d3.select('#accpm-rsvg-wrapper svg')
    .attr('viewBox').split(' ').map(parseFloat);
  var width = viewBox[2], height = viewBox[3];
  var mproj = d3.geo.mercator().center([121,24]).scale(6000);	// 指定投影中心 .
  var mapObjs = d3.geo.path().projection(mproj);
  
  /* 變數前沒var => global variable */
  /* 在main.css 把畫town的一些css去掉 , 變成無邊際 */
  towns = d3.select('#pm-canvas').selectAll('path.town')
    .data(G.townBoundary.features);
  
  towns.enter()
    .append('path')
    .attr('d', function(d) {
      return mapObjs(d);
    })
    .attr('class', 'town')
    .append('svg:title')
    .text(function(d) {
      return d.properties.name;
    });


 var counties = d3.select('#pm-canvas').selectAll('path.county');
  counties.remove();
  counties = d3.select('#pm-canvas').selectAll('path.county')
    .data(G.countyBoundary.features, function(d) {
      return d.properties['C_Name'];
    });
  counties.enter()
    .append('path')
    .attr('d', mapObjs)
    .attr('class', 'county')
    .attr('stroke', 'black')
    .attr('fill', 'none')
    .attr('stroke-width', 1.0)
    .append('svg:title')
    .text(function(d) {
      return d.properties['C_Name'];
    });
    
  refreshCurrent();
}

function init(error, data) {
  /******************* received input data files *******************/
  if (error) { return console.warn(error); }

  G.townBoundary = data[0];         // 鄉鎮市相關物件 .
  G.countyBoundary = data[1];       // 直轄縣市相關物件 .
  G.busy = data[2];                 // 交通尖峰非尖峰資料 .
  G.accident = data[3];             // 交通事故累積資料 .

  //console.log(G);

  /* Acc's map slider */
  /* ref : http://sujeetsr.github.io/d3.slider/ */
  
  startValue = d3.select('#acc-text-start-date').text();
  startDateSlider = d3.slider()
                      .min(1)
                      .max(31)
                      .value(startValue)
                      .stepValues([1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31])
                      .callback(onStartDateChange); // 監聽slide事件 , 一發生就call onStartDateChange()
  d3.select('#acc-slider-start-date').call(startDateSlider);    
  
  endValue = d3.select('#acc-text-end-date').text();
  endDateSlider = d3.slider()
                    .min(1)
                    .max(31)
                    .value(endValue)
                    .stepValues([1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31])
                    .callback(onEndDateChange);  // 監聽slide事件 , 一發生就call onEndDateChange()
  d3.select('#acc-slider-end-date').call(endDateSlider);     


  /* Acc's map canvas */
  d3.select('#accpm-rsvg-wrapper')
    .append('svg')
    .attr('preserveAspectRatio', 'xMinYMin meet')
    .attr('viewBox', '0 100 800 600')
    .attr('class', 'rsvg-content')
    //.call(pmzoom) 					    // 註解掉可關閉zoom in out 功能
    .append('g')
    .attr('id', 'pm-zoom-or-zoomless')	/* legend's id */
    .append('g')
    .attr('id', 'pm-canvas');

  /* Line-lengend */

  var DateLineSvg = d3.select('#date-line').append('svg');
  DateLineSvg.append('line').attr('x1', 0).attr('y1', 150).attr('x2', 300).attr('y2', 150).style('stroke', '#C0C0C0').style('stroke-width', 4);
  var DateLineSvgEnd = d3.select('#date-line-end').append('svg');
  DateLineSvgEnd.append('line').attr('x1', 0).attr('y1', 80).attr('x2', 300).attr('y2', 80).style('stroke', '#c0c0c0').style('stroke-width', 2); 

  
  startDrawingMap();
  drawLegend();

  /* Call Traffic Init .*/
  trafinit();
  accTrafinit();
}

//console.log(Taiwan);
//console.log(AreaAccPM25);

/* I/O讀取的queue */
queue()
  .defer(d3.json, 'town-boundary.json')
  .defer(d3.json, 'county-boundary.json')
  .defer(d3.json, 'busy_info.json')
  .defer(d3.json, 'accident.json')
  .awaitAll(init);
