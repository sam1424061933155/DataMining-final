var start=1,end=31;

var is_busy={};
var no_busy={};
var choosebusyornot=0;
var w=1500;
var h=230;
function onDayStartChange() {
  traffStartDay = parseInt(traffStartDaySlider.value());
  d3.select('#text-start').text(traffStartDaySlider.value());

  if(traffStartDay > traffEndDay)
  {

    traffEndDaySlider.setValue(traffStartDay);
    traffEndDay = traffStartDay ;
  } 
  trafrefreshMap();
}

function onDayEndChange() {
  traffEndDay = parseInt(traffEndDaySlider.value())
  d3.select('#text-end').text(traffEndDaySlider.value());

  if(traffStartDay > traffEndDay){
    traffStartDaySlider.setValue(traffEndDay);
    traffStartDay = traffEndDay;
  } 

  trafrefreshMap();
}


function trafrefreshMap(){

  var canvas = d3.select('#map_canvas'),
      towns = canvas.selectAll('path.town'),
      prmin = 0,
      prmax = -1;

  if(start>end){
    var temp=start;
    start=end;
    end=temp;
  }
  towns.attr("fill",'#FCCA73');
  
  for(var i=start;i<=end;i++){
    //console.log("day = "+i);
    d3.select('.date_title').text(i);
    prmax=-1;
    if(choosebusyornot==1){
      for(var key in is_busy){
        if(is_busy[key][i]>prmax){
          prmax=is_busy[key][i];
        }
      }
      var ratio2color = d3.scale.linear()
      .range(["#ffffcc", "#800026"])
      .interpolate(d3.interpolateLab)
      .domain([prmin,prmax]);
      towns.transition().duration(5000)
      .attr('fill', function(d) {
        if(d.properties['C_Name']=='臺中市'){
          console.log(d.properties['T_Name']+","+is_busy[d.properties['T_Name']][i])
          return ratio2color(is_busy[d.properties['T_Name']][i]);
        }
      });
    }else if(choosebusyornot==0){
      for(var key in no_busy){
        if(no_busy[key][i]>prmax){
          prmax=no_busy[key][i];
        }
      }
      var ratio2color = d3.scale.linear()
      .range(["#ffffcc", "#800026"])
      .interpolate(d3.interpolateLab)
      .domain([prmin,prmax]);
      towns.transition().duration(5000)
      .attr('fill', function(d) {
        if(d.properties['C_Name']=='臺中市'){
          //console.log(d.properties['T_Name']+","+no_busy[d.properties['T_Name']][i])
          return ratio2color(no_busy[d.properties['T_Name']][i]);
        }
      });
    }
   //barchart(i);
    
  }
  
}

function choosebusy(){
    choosebusyornot=1;
    //d3.select('#text-busy').text('尖峰');
    console.log("busy");
    d3.select("#busy_button").style("background-color", "#ADADAD");  
    d3.select("#nobusy_button").style("background-color", "white");

}
function choosenotbusy(){
    choosebusyornot=0;
    //d3.select('#text-busy').text('非尖峰');
    console.log("nobusy");
    d3.select("#nobusy_button").style("background-color", "#ADADAD");
    d3.select("#busy_button").style("background-color", "white");


}
function barchart(i){
  console.log("in barchart");
   
  var bar_data=[];
  if(choosebusyornot==1){
    for(var key in is_busy){
      //console.log(key + ","+no_busy[key][1]);
      var temp=[];
      temp.push(key);
      temp.push(is_busy[key][i]);
      bar_data.push(temp);
    }
  }else{
    for(var key in no_busy){
      //console.log(key + ","+no_busy[key][1]);
      var temp=[];
      temp.push(key);
      temp.push(no_busy[key][i]);
      bar_data.push(temp);
    }  
  }
   
   
   //var w=1500;
   //var h=200;
   
    var div_data_bind = d3.select("#tip").selectAll("rect.chart");
    div_data_bind.remove();
    div_data_bind = d3.select("#tip").attr('width',w).attr('height',h).selectAll("rect.chart").data(bar_data);
    div_set = div_data_bind.enter().append("rect").attr('class','chart').attr('width','0').attr('height','0'); /*為「沒有物件可配對的資料」建立標籤 */
    
    
    div_set.attr("y", function(d,i){
      return   h-4*d[1];
    })
      .attr("x",function(d,i){
          return 10+49*i;
      })
      .attr("width",15) 
      /*.attr('height',function(d,i) {
        return 4*d[1];
      })*/
      .attr('fill','red')
      .transition().duration(3000)
      .attr({
        'height' : function(d){
          return 4*d[1];
        }
      });

      

      var text = d3.select("#tip").selectAll("text");
      text.remove();
      text =  d3.select("#tip").selectAll("text").data(bar_data).enter().append("text");

      //var text = d3.select("#tip").selectAll("text").data(bar_data).enter().append("text")
      var textLabels = text
        .attr("x",function(d,i){
        return 10+49*i;
        })
        .attr("y",function(d,i){
          return h-4*d[1]-3;
        })
        .transition().duration(3000)
        .text(function(d){
          return d[1];
        });

      var text1 = d3.select("#tip").selectAll("text.place").data(bar_data).enter().append("text")
      var textLabels1 = text1
        .attr("x",function(d,i){
        return 10+49*i;
        })
        .attr("y",function(d,i){
          return 228;
        })
        .text(function(d){
          return d[0];
        })
        .attr("font-size", "10px")
   

}


function trafinit() {
  /******************* received input data files *******************/

  //if (error) { return console.warn(error); }

 /*
  G.countyBoundary = data[0];
  G.townBoundary = data[1];  
  G.busy = data[2];  
  G.accident = data[3];
  */

  
  /******************* population map *******************/
  // population map zoom


  d3.select('#trafmap')
    .append('svg')
    .attr('class','map')
    .attr('viewBox', '0 0 800 600')
    .attr('id','map_canvas')
    .attr('width','600')




  /**************** start default target city/county ****************/
  
  G.targetCity = '臺中市';
  var viewBox = d3.select('#trafmap svg')
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

  // draw counties before towns of target county for
  // correct z-order
  // https://stackoverflow.com/questions/482115/with-javascript-can-i-change-the-z-index-layer-of-an-svg-g-element
  var counties = d3.select('#trafmap svg').selectAll('path.county');
  counties.remove();
  counties = d3.select('#trafmap svg').selectAll('path.county')
    .data(G.countyBoundary.features, function(d) {
      return d.properties['C_Name'];
    });
  counties.enter()
    .append('path')
    .attr('d', mapObjs)
    .attr('class', 'county')
    .attr('fill', '#FFFFFF')
    .attr('stroke', 'black')
    .attr('stroke-width', 1)
    .append('svg:title')
    .text(function(d) {
      return d.properties['C_Name'];
    });

 
    

  var towns = d3.select('#trafmap svg').selectAll('path.town');
  towns.remove();
  towns = d3.select('#trafmap svg').selectAll('path.town')
    .data(G.townBoundary.features, function(d) {
      if(d.properties['C_Name']=='臺中市'){
        is_busy[d.properties['T_Name']]={};
        no_busy[d.properties['T_Name']]={};
        return d.properties['T_Name'];
      }
    });
  towns.enter()
    .append('path')
    .attr('d', mapObjs)
    .attr('class', 'town')
    .attr('fill', '#FCCA73')
    .attr('stroke', 'black')
    .attr('stroke-width', 1)
    .append('svg:title')
    .text(function(d) {
      return d.properties['T_Name'];
    });

  var taichung = d3.select('#trafmap svg').selectAll('path.taichung');
  taichung.remove();
  taichung = d3.select('#trafmap svg').selectAll('path.taichung')
    .data(G.countyBoundary.features, function(d) {
      if(d.properties['C_Name']=='臺中市'){
        return d.properties['C_Name'];
      }
    });
  taichung.enter()
    .append('path')
    .attr('d', mapObjs)
    .attr('class', 'taichung')
    .attr('fill','none')
    .attr('stroke', '#F75000')
    .attr('stroke-width', 3)
    .append('svg:title')


  traffStartDay = parseInt(d3.select('#text-start').text());

  traffStartDaySlider = d3.slider()
      .min(1)
      .max(31)
      .value(traffStartDay)
      .stepValues([1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31])
      .callback(onDayStartChange); // 監聽slide事件 , 一發生就call onStartDateChange()
  
  d3.select('#slider-start').call(traffStartDaySlider);
  

  traffEndDay = parseInt(d3.select('#text-end').text());

  traffEndDaySlider = d3.slider()
      .min(1)
      .max(31)
      .value(traffEndDay)
      .stepValues([1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31])
      .callback(onDayEndChange); // 監聽slide事件 , 一發生就call onStartDateChange()

  d3.select('#slider-end').call(traffEndDaySlider);
  

   for (var key in is_busy){
      for(var i=1;i<32;i++){
        is_busy[key][i]=0;
        no_busy[key][i]=0;
      }
   }
   G.busy.forEach(function(d) {
    if(d.busy=="1"){
      if(is_busy[d.district][d.day]!=null){
        is_busy[d.district][d.day]=is_busy[d.district][d.day]+1;
      }else{
        is_busy[d.district][d.day]=1;
      }
    }else{
      if(no_busy[d.district][d.day]!=null){
        no_busy[d.district][d.day]=no_busy[d.district][d.day]+1;
      }else{
        no_busy[d.district][d.day]=1;
      }
    }
  });

   var bar_data=[];
   for(var key in no_busy){
    //console.log(key + ","+no_busy[key][1]);
    var temp=[];
    temp.push(key);
    temp.push(no_busy[key][1]);
    bar_data.push(temp);
   }
   

        var DateLineSvg = d3.select('#text-start-line').append('svg');
        DateLineSvg.append('line').attr('x1', 0).attr('y1', 0).attr('x2', 200).attr('y2', 0).style('stroke', '#C0C0C0').style('stroke-width', 2);
        var DateLineSvg1 = d3.select('#text-end-line').append('svg');
        DateLineSvg1.append('line').attr('x1', 0).attr('y1', 0).attr('x2', 200).attr('y2', 0).style('stroke', '#c0c0c0').style('stroke-width', 2);


        var ratio2color = d3.scale.linear()
          .range(["#ffffcc", "#800026"])
          .interpolate(d3.interpolateLab)
          .domain([0,7]);

        var svg_legend = d3.select(".legend").append("svg");

        svg_legend.append("g")
          .attr("class", "legendLinear")
          //.attr("transform", "translate(20,20)")
          
        var legendLinear = d3.legend.color()
          .shapeWidth(30)
          .cells(8)
          .orient('horizontal')
          .ascending(false)
          .labels(["no", "", "", "", "","","","high"]);
        legendLinear.scale(ratio2color);
        legendLinear(d3.select(".legendLinear"));

        //d3.selectAll('.busy_button').on('click', choosebusy());
        //accTrafinit();
        d3.selectAll('button.busy_button').on('click', choosebusy);
        d3.selectAll('button.nobusy_button').on('click', choosenotbusy);

 
}
