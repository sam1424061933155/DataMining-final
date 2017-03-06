/*  Global Variables :
 *    G : Input data (Conutry boundary , Town boundary) obj.
 *    startDateSlider / endDateSlider : Slider obj.
 *    startValue / endValue : start/end date .
 *    
 */ 

/* Constant */
const monthDay = 31 ;
const hoursPerDay = 24 ;

function getCurrentTimePM25(town)
{
	if(TargetArea.indexOf(town) < 0) return -1;
  var currentTimeStr = d3.select('#imm-text-current-time').text();
  var strArray = currentTimeStr.split("/");
  var dateStr = strArray[0];
  var timeStr = strArray[1];

  if(!(dateStr in Taiwan[town])) return -1;
  if(!(timeStr in Taiwan[town][dateStr])) return -1;

  return (parseInt(Taiwan[town][dateStr][timeStr]['acc'])/parseInt(Taiwan[town][dateStr][timeStr]['count'])).toFixed(0);
}

// 起始日期
/* 設定 slider值來給其他func取 */
// https://github.com/MasterMaps/d3-slider
function imm_onStartDateChange() {
  startTime = imm_startDateSlider.value() ;
  var startTimeStr = mapValue2Time(startTime);
  d3.select('#imm-text-start-time').text(startTimeStr);
  
  if(startTime > endTime)
  {
    imm_endDateSlider.setValue(startTime);
    //console.log(imm_endValue);
    endTime = startTime ;
  } 
}

// 結束日期
function imm_onEndDateChange() {
  endTime = imm_endDateSlider.value() ;
  var endTimeStr = mapValue2Time(endTime);
  d3.select('#imm-text-end-time').text(endTimeStr);
  
  if(startTime > endTime){
    imm_startDateSlider.setValue(endTime);
    startTime = endTime;
  } 
}

function mapValue2Time(value)
{
  var dateValue = (Math.floor(value / hoursPerDay)) + 1;
  var timeValue = (value % hoursPerDay)  ;

  //console.log(dateValue);
  if(timeValue === -1) timeValue = 23 ;

  var timeStr = timeValue.toString() + ":00:00" ;
  if(timeValue < 10)
    timeStr = "0" + timeStr ;

  var dateStr = "" ;
  if(dateValue < 10)
    dateStr = "2016-10-0" + dateValue.toString() ;
  else
    dateStr = "2016-10-" + dateValue.toString() ;


  return dateStr + "/" + timeStr ;

}


/* 處理區塊上色部分 */
// http://bl.ocks.org/mbostock/4060606 'choropleth'
function imm_refreshMap() {
  var canvas = d3.select('#imm-pm-canvas'),
  towns = canvas.selectAll('path.town');

  towns.transition()
    .attr('fill', function(d) {
    	//console.log(getPM25(d.properties.name));
      return PM2Color(getCurrentTimePM25(d.properties.name));  /* PM2Color : form PM_accMap.js */
    });
}

function imm_refreshCurrent() {
  imm_refreshMap();
 }

 
 function imm_drawLegend() {
  // http://d3-legend.susielu.com/
  // https://github.com/susielu/d3-legend/issues/15
  // take care to prevent the legend from being scaled
  
  var ordinal = d3.scale.ordinal()
  .domain(["71","65","59","54","48","42","36","24","12","0"])
  .range(["#642100","#842B00","#A23400","#BB3D00","#D94600","#FF5809","#FF8F59","#FFAD86","#FFCBB3","#FFDAC8"]);

  
  d3.select('#imm-color-legend-bar')
    .append('svg')
    .attr('id', 'imm-color-legend')
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
  G.legendPainter(d3.select('#imm-color-legend'));

}

function imm_startDrawingMap() {

/******************* population map *******************/
  /* 取得ViewBox 長與寬 */
  var viewBox = d3.select('#immpm-rsvg-wrapper svg')
    .attr('viewBox').split(' ').map(parseFloat);
  var width = viewBox[2], height = viewBox[3];
  var mproj = d3.geo.mercator().center([121,24]).scale(6000);	// 指定投影中心 .
  var mapObjs = d3.geo.path().projection(mproj);
  
  /* 變數前沒var => global variable */
  /* 在main.css 把畫town的一些css去掉 , 變成無邊際 */
  towns = d3.select('#imm-pm-canvas').selectAll('path.town')
    .data(G.townBoundary.features);
  
  towns.enter()
    .append('path')
    .attr('d', function(d) {
      return mapObjs(d);
    })
    .attr('class', 'town')
    .attr('fill', '#FFF3EE')
    .append('svg:title')
    .text(function(d) {
      return d.properties.name;
    });


 var counties = d3.select('#imm-pm-canvas').selectAll('path.county');
  counties.remove();
  counties = d3.select('#imm-pm-canvas').selectAll('path.county')
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
    
}

function imm_init() {

  /* Imm's map slider */
  /* ref : http://sujeetsr.github.io/d3.slider/ */

  /* Create slider value array */

  var sliderStepValues = [];
  for(i = 0 ; i < monthDay * hoursPerDay ; i ++)
  {
    sliderStepValues.push(i);
  }
  
  startTime = 0;
  d3.select('#imm-text-start-time').text(mapValue2Time(startTime));
  imm_startDateSlider = d3.slider()
                      .min(0)
                      .max(monthDay * hoursPerDay - 1)
                      .value(startTime)
                      .ticks(monthDay)
                      .stepValues(sliderStepValues)
                      .callback(imm_onStartDateChange); // 監聽slide事件 , 一發生就call onStartDateChange()
  d3.select('#imm-slider-start-time').call(imm_startDateSlider);    
  
  endTime = 0;
  d3.select('#imm-text-end-time').text(mapValue2Time(endTime));
  imm_endDateSlider = d3.slider()
                    .min(0)
                    .max(monthDay * hoursPerDay - 1)
                    .value(endTime)
                    .ticks(monthDay)
                    .stepValues(sliderStepValues)
                    .callback(imm_onEndDateChange);  // 監聽slide事件 , 一發生就call onEndDateChange()
  d3.select('#imm-slider-end-time').call(imm_endDateSlider);     

  /* Imm's map canvas */
  d3.select('#immpm-rsvg-wrapper')
    .append('svg')
    .attr('preserveAspectRatio', 'xMinYMin meet')
    .attr('viewBox', '0 -400 1000 1200')
    .attr('class', 'rsvg-content-2')
    //.call(pmzoom) 					    // 註解掉可關閉zoom in out 功能
    .append('g')
    .attr('id', 'imm-pm-zoom-or-zoomless')	/* legend's id */
    .append('g')
    .attr('id', 'imm-pm-canvas');

  
  

  console.log(Taiwan);
  imm_drawLegend();
  imm_startDrawingMap();
}
