/* global window, console, d3, queue */
// https://stackoverflow.com/questions/11957977/how-to-fix-foo-is-not-defined-error-reported-by-jslint
//var G = { }; // global variables
var accTrafstart=1,accTrafend=31;
var acuu={ };
var accident={ };


function onAcciStartChange() {

  traffAccStartDay = parseInt(traffAccStartDaySlider.value());
  d3.select('#acc-traf-text-month-min').text(traffAccStartDaySlider.value());

  if(traffAccStartDay > traffAccEndDay)
  {
    traffAccEndDaySlider.setValue(traffAccStartDay);
    traffAccEndDay = traffAccStartDay ;
  } 
  accTrafrefreshMap();
}

function onAcciEndChange() {

  traffAccEndDay = parseInt(traffAccEndDaySlider.value())
  d3.select('#acc-traf-text-month-max').text(traffAccEndDaySlider.value());

  if(traffAccStartDay > traffAccEndDay){
    traffAccStartDaySlider.setValue(traffAccEndDay);
    traffAccStartDay = traffAccEndDay;
  } 

  accTrafrefreshMap();
}



function accTrafrefreshMap() {
  var canvas = d3.select('#acc-traf-pm-canvas'),
      towns = canvas.selectAll('path.town'),
      prmin = 0,
      prmax = -1;
      
   if(accTrafstart>accTrafend){
    var temp=accTrafstart;
    accTrafstart=accTrafend;
    accTrafend=temp;
   }
   towns.attr("fill",'#FCCA73');
   for(var key in accident){
    acuu[key][1]=accident[key][1];
   }
   for(var i=2;i<=31;i++){
    //console.log("Hello!day = "+i);
    d3.select('.date_title').text(i);
    for(var key in accident){
        acuu[key][i]=acuu[key][i-1]+accident[key][i];        
    }
   }

   for(var i=accTrafstart;i<=accTrafend;i++){
        //console.log("Hi!day = "+i);
        d3.select('.date_title').text(i);
        prmax=-1;
        
      for(var key in acuu){
           if(acuu[key][i]>prmax){
          prmax=acuu[key][i];
        }
      }
      var ratio2color = d3.scale.linear()
      .range(["#ffffcc", "#800026"])
      .interpolate(d3.interpolateLab)
      .domain([prmin,prmax]);
      
      towns.transition().duration(5000)
      .attr('fill', function(d) {
        if(d.properties['C_Name']=='臺中市'){
          //console.log(d.properties['T_Name']+","+acuu[d.properties['T_Name']][i])
          return ratio2color(acuu[d.properties['T_Name']][i]);
        }
      });
   
   }
}

function accTrafprepareTargetRegion(selected) {

  G.targetCity = selected;

  /******************* population map *******************/
  // https://stackoverflow.com/questions/14492284/center-a-map-in-d3-given-a-geojson-object
  // https://stackoverflow.com/questions/16265123/resize-svg-when-window-is-resized-in-d3-js
  var viewBox = d3.select('#trafAccmap svg')
    .attr('viewBox').split(' ').map(parseFloat);
  var width = viewBox[2], height = viewBox[3];
  var mproj = d3.geo.mercator().scale(1).translate([0, 0]);
  var mapObjs = d3.geo.path().projection(mproj);
  var targetBoundary = {
    'type': 'FeatureCollection'
  };
  targetBoundary.features = G.countyBoundary.features.filter(function(d) {
    return d.properties['C_Name'].indexOf(G.targetCity) >= 0;
  });
  
  
  var b = mapObjs.bounds(targetBoundary),
    s = 0.95 / Math.max((b[1][0] - b[0][0]) / width, (b[1][1] - b[0][1]) / height),
    t = [(width - s * (b[1][0] + b[0][0])) / 2, (height - s * (b[1][1] + b[0][1])) / 2];
  mproj.scale(s).translate(t);
  

  var counties = d3.select('#trafAccmap svg').selectAll('path.county');
  counties.remove();
  counties = d3.select('#trafAccmap svg').selectAll('path.county')
    .data(G.countyBoundary.features, function(d) {
      return d.properties['C_Name'];
    });
  counties.enter()
    .append('path')
    .attr('d', mapObjs)
    .attr('class', 'county')
    .attr('fill', '#F8F8F8')
    .attr('stroke', 'black')
    .attr('stroke-width', 1)
    .append('svg:title')
    .text(function(d) {
      return d.properties['C_Name'];
    });
    
    var towns = d3.select('#trafAccmap svg').selectAll('path.town');
    towns.remove();
    
    towns = d3.select('#trafAccmap svg').selectAll('path.town')
        .data(G.townBoundary.features,function(d){
            if (d.properties['C_Name']=="臺中市"){
            accident[d.properties['T_Name']]={};
            acuu[d.properties['T_Name']]={};
            return d.properties['T_Name'];
            }
        });
    
    towns.enter()
      .append('path')
      .attr('d',mapObjs)
      .attr('class', 'town')
      .attr('fill', '#FCCA73')
      .attr('stroke', 'black')
      .attr('stroke-width',1)
      .append('svg:title')
      .text(function(d){
          return d.properties['T_Name'];
      });
     
  
}

function accTrafinit() {
  /******************* received input data files *******************/
  //if (error) { return console.warn(error); }
  //G.townBoundary = data[1];
  //G.countyBoundary = data[2];


  /******************* slider *******************/

  traffAccStartDay = parseInt(d3.select('#acc-traf-text-month-min').text());

  traffAccStartDaySlider = d3.slider()
      .min(1)
      .max(31)
      .value(traffAccStartDay)
      .stepValues([1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31])
      .callback(onAcciStartChange); // 監聽slide事件 , 一發生就call onStartDateChange()
  
  d3.select('#acc-traf-slider-start').call(traffAccStartDaySlider);
  

  traffAccEndDay = parseInt(d3.select('#acc-traf-text-month-max').text());

  traffAccEndDaySlider = d3.slider()
      .min(1)
      .max(31)
      .value(traffAccEndDay)
      .stepValues([1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31])
      .callback(onAcciEndChange); // 監聽slide事件 , 一發生就call onStartDateChange()

  d3.select('#acc-traf-slider-end').call(traffAccEndDaySlider);

  /*
  var v = d3.select('#acc-traf-text-month-min').text();
  d3.select('#acc-traf-slider-start').call(
    d3.slider().axis(true).min(1).max(31)
      .step(1).value(v).on('slide', onAcciStartChange)
  );
  
  v = d3.select('#acc-traf-text-month-max').text();
  d3.select('#acc-traf-slider-end').call(
    d3.slider().axis(true).min(1).max(31)
      .step(1).value(v).on('slide', onAcciEndChange)
  );
  */
  /******************* population map *******************/
  // population map zoom

  d3.select('#trafAccmap')
    .append('svg')
    .attr('class','map')
    .attr('viewBox', '0 0 800 600')
    .attr('id', 'acc-traf-pm-canvas')
     .attr('width','600');

  /**************** start default target city/county ****************/
  var defaultTarget = '臺中市';
  d3.select('#region-selection').property('value', defaultTarget);
  accTrafprepareTargetRegion(defaultTarget);
  
  /******底線*****
  var DateLineSvg = d3.select('#acc-traf-text-start-line').append('svg');
        DateLineSvg.append('line').attr('x1', 0).attr('y1', 0).attr('x2', 200).attr('y2', 0).style('stroke', '#C0C0C0').style('stroke-width', 2);
  var DateLineSvg1 = d3.select('#acc-traf-text-end-line').append('svg');
        DateLineSvg1.append('line').attr('x1', 0).attr('y1', 0).attr('x2', 200).attr('y2', 0).style('stroke', '#c0c0c0').style('stroke-width', 2);
  */
  
  for (var key in accident){
      for(var i=1;i<32;i++){
        accident[key][i]=0;
      }
   }
   
   for (var key in acuu){
    for(var i=1;i<32;i++){
        acuu[key][i]=0;    
    }
   }
  
     G.accident.forEach(function(d) {
        if(accident[d.place][d.day]!=null){
        accident[d.place][d.day]=accident[d.place][d.day]+1;
      }
  });
     G.accident.forEach(function(d){
        if(acuu[d.place][d.day]!=null){
        acuu[d.place][d.day]=0;
        }
     });


        var ratio2color = d3.scale.linear()
          .range(["#ffffcc", "#800026"])
          .interpolate(d3.interpolateLab)
          .domain([0,7]);

        var svg_legend = d3.select("#acc_legend").append("svg");

        svg_legend.append("g")
          .attr("class", "acc_legendLinear")
          //.attr("transform", "translate(20,20)")
          
        var legendLinear = d3.legend.color()
          .shapeWidth(30)
          .cells(8)
          .orient('horizontal')
          .ascending(false)
          .labels(["no", "", "", "", "","","","high"]);
        legendLinear.scale(ratio2color);
        legendLinear(d3.select(".acc_legendLinear"));
}


