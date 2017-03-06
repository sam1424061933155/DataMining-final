var w= 200;
var h= 50;

var svg= d3.select("#imm-button")
            .append("svg")
            .attr("width",w)
            .attr("height",h)
            .attr("transform","translate(200,200)")
//container for all buttons
var allButtons= svg.append("g")
                   .attr("id","allButtons") 

// button 的圖案 .
var labels= ['\uf01d','\uf28c'];

//colors for different button states 
var defaultColor= "#000000"
var hoverColor= "#555555"
var pressedColor= "#642100"

//groups for each button (which will hold a rect and text)
var buttonGroups= allButtons.selectAll("g.button")
                            .data(labels)
                            .enter()
                            .append("g")
                            .attr("class","button")
                            .style("cursor","pointer")
                            .on("click",function(d,i) {
                                  updateButtonColors(d3.select(this), d3.select(this.parentNode))
                                  buttonDown(i);    /* 照data順序的index */
                             })
                             .on("mouseover", function() {
                                  if (d3.select(this).select("rect").attr("fill") != pressedColor) {
                                      d3.select(this)
                                        .select("rect")
                                        .attr("fill",hoverColor);
                                  }
                              })
                              .on("mouseout", function() {
                                  if (d3.select(this).select("rect").attr("fill") != pressedColor) {
                                      d3.select(this)
                                      .select("rect")
                                      .attr("fill",defaultColor);
                                  }
                              })

var bWidth= 40; //button width
var bHeight= 25; //button height
var bSpace= 10; //space between buttons
var x0= 20; //x offset
var y0= 10; //y offset

//adding a rect to each toggle button group
//rx and ry give the rect rounded corner
buttonGroups.append("rect")
            .attr("class","buttonRect")
            .attr("width",bWidth)
            .attr("height",bHeight)
            .attr("x",function(d,i) {return x0+(bWidth+bSpace)*i;})
            .attr("y",y0)
            .attr("rx",5) //rx and ry give the buttons rounded corners
            .attr("ry",5)
            .attr("fill",defaultColor);

//adding text to each toggle button group, centered 
//within the toggle button rect
buttonGroups.append("text")
            .attr("class","buttonText")
            .attr("font-family","FontAwesome")
            .attr("x",function(d,i) {
                return x0 + (bWidth+bSpace)*i + bWidth/2;
              })
            .attr("y",y0+bHeight/2)
            .attr("text-anchor","middle")
            .attr("dominant-baseline","central")
            .attr("fill","white")
            .text(function(d) {return d;});

function updateButtonColors(button, parent) {
    parent.selectAll("rect")
          .attr("fill",defaultColor)

    button.select("rect")
          .attr("fill",pressedColor)
}

var PauseMode = false ;
var PlaySpeed = 300 ;

function buttonDown(index)
{
  if(index === 0)           /* Play btn */
  {
    PauseMode = false;
    onPlayBtnClick();
    
  }
  else if(index === 1)    /* Pause btn */
  {
    PauseMode = true;
  }
}

function onPlayBtnClick() {
    
    if(PauseMode) return;
    imm_startDateSlider.setValue(startTime);
    var startTimeStr = d3.select('#imm-text-start-time').text();
    d3.select('#imm-text-current-time').text(startTimeStr);
    imm_refreshCurrent();
    if( startTime < endTime ){
        startTime++;
        setTimeout( onPlayBtnClick, PlaySpeed );
    }

}


