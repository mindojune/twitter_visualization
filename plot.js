'use strict';

// TODO 1: Showing 2 plots
// Idea 1: Combine them inside the model... and give them two diff thems.
// Idea 2: Two separate streams ==> seems more straightfoward why not? => x axis and stuff
// TODO 2: Idea for Bottom Aggregate Visualization
// TODO 3: Some major refactoring due

class Plot {
  constructor(curr_data1) {
      this.svg = d3.selectAll("svg");

      this.margin  = {top: 20, bottom: 110, right: 20,  left: 80};
      this.margin2 = {top: 430, bottom: 30, right: 20,  left: 80};
      this.margin3 = {top: 430, bottom: 30, right: 20,  left: 80};
      this.width = +this.svg.attr("width") - this.margin.left - this.margin.right;      // 900
      this.height = +this.svg.attr("height")/(2) - this.margin.top - this.margin.bottom;    // 370
      this.height2 = +this.svg.attr("height")/(2) - this.margin2.top - this.margin2.bottom; // 40
      this.height3 = +this.svg.attr("height") -this.margin3.top - this.margin3.bottom ; // 40
      this.parseDate = d3.timeParse("%Y-%m-%d");
      
      this.curr_data1 = curr_data1;

      this.selected_date = -1;
      // Ignore those but don't delete
      this.zoomed_flag = 0;
      this.brushed_flag = 0;
  } 

  draw() {
    this.createXScaleAxis();
    this.createYScaleAxis();    
    this.createBrush();
    //this.createZoom(); // can be optional

    this.drawFocus();
    this.drawContext();

    this.drawLine1();
    this.drawLine2();
    this.drawAxisX();
    this.drawAxisY();    

    this.drawLegend();

    this.createToolTip();

    this.addClip();
    this.addBrush();
    //this.addZoom(); // can be optional <=> this commenting (noZoom) is necessary for 
                      // my current tooltip implementation to work: reason = right now zoom blocks clickevents
  }

  drawLegend(){
    this.svg.append("circle").attr("cx",this.width).attr("cy",this.height/10).attr("r", 6).style("fill", "red")
    this.svg.append("circle").attr("cx",this.width).attr("cy",this.height/10+20).attr("r", 6).style("fill", "steelblue")
    this.svg.append("text").attr("x", this.width+10).attr("y", this.height/10).text("#MAGA").attr("font-family", "noto").style("font-size", "15px").attr("alignment-baseline","middle")
    this.svg.append("text").attr("x", this.width+10).attr("y", this.height/10+20).text("#METOO").attr("font-family", "noto").style("font-size", "15px").attr("alignment-baseline","middle")
  }


  createXScaleAxis() {
      this.x1 = d3.scaleTime().range([0, this.width]);
      this.x2 = d3.scaleTime().range([0, this.width]);
      this.xAxis1 = d3.axisBottom(this.x1);
      this.xAxis2 = d3.axisBottom(this.x2);
      this.x1.domain(d3.extent(this.curr_data1, function(d) { return d.date; }));  
      this.x2.domain(this.x1.domain());
  }

  createYScaleAxis() {
      this.y1 = d3.scaleLinear().range([this.height, 0]),
      this.y2 = d3.scaleLinear().range([this.height2, 0]);
      this.yAxis = d3.axisLeft(this.y1);
      this.y1.domain([0, d3.max(this.curr_data1, function(d) { return Math.max(d.value1, d.value2); })]);
      this.y2.domain(this.y1.domain());
  }



  createBrush(){
      this.brush = d3.brushX(this)
      .extent([[0, 0], [this.width, this.height2]])
      .on("brush end", this.brushed.bind(this));
  }


  createZoom(){
      this.zoom = d3.zoom(this)
      .scaleExtent([1, Infinity])
      .translateExtent([[0, 0], [this.width, this.height]])
      .extent([[0, 0], [this.width, this.height]])
      .on("zoom", this.zoomed.bind(this));
  }

  createToolTip(){
    
    //const tooltip = this.focus.append('div').attr("class", "tooltip").style("opacity", 0);
    const tooltip = this.focus.append('text'); //.attr("class", "tooltip").style("opacity", 1);
    const tooltipLine = this.focus.append('line');

      var x1 = this.x1;
      var y1 = this.y1;

     this.removeTooltip = function() {
          if (tooltip) tooltip.style('display', 'none');
          if (tooltipLine) tooltipLine.attr('stroke', 'none');
        }

    var width = this.width;
    var height =this.height;
    var $this = this;
    
    this.drawTooltip = function() {
            var xm = x1.invert(d3.mouse(this)[0]); // THIS IS CORRECT
            var ym = y1.invert(d3.mouse(this)[1]); // THIS IS CORRECT

            const date = d3.timeFormat("%Y-%m-%d")(xm);
            
            $this.selected_date = date;

            var xpos = d3.mouse(this)[0] ;
            var ypos = d3.mouse(this)[1] ;
            

            tooltipLine.attr('stroke', 'black')
                .attr("stroke-width", 2.5)
                .attr("x1", xpos)
                .attr("x2", xpos)
                .attr('y1', 0)
                .attr('y2', height);    

            // Make it work
            // tooltip.transition()        
            //         .duration(200)      
            //         .style("opacity", .9);      
            // tooltip.html("qdw")  
            //         .style("left", xpos+10)     
            //         .style("top", ypos);   

            tooltip.html("Data on " + date)
                .style('display', 'block')
                .attr("x", xpos+10)
                .attr("y", ypos)
                .attr("font-family", "noto")
                .attr("font-size", "20px")
                .append('div')
                .style('color', "red")
                ;

    }

    this.tipBox = this.focus.append('rect')
        .attr('width', width)
        .attr('height', height)
        .attr('opacity', 0)
        .on('mousemove', this.drawTooltip)
        .on('mouseout', this.removeTooltip);

  }

  drawFocus(){
    this.focus = this.svg.selectAll('.focus');

    //this.focus.remove(); //
    this.focus = this.svg.append("g")
        .attr("class", "focus")
        .attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")") ;
  }

  drawContext(){
    this.context = this.svg.selectAll('.context');

    //this.context.remove();
    this.context = this.svg.append("g")
        .attr("class", "context")
        .attr("transform", "translate(" + this.margin2.left + "," + this.margin2.top + ")");
  }


  drawLine1(){
     
    var $this = this;

    this.line1MAGA = d3.line()
        .x(function(d) { return $this.x1(d.date); })
        .y(function(d) { return $this.y1(d.value1); });

    this.line1METOO = d3.line()
        .x(function(d) { return $this.x1(d.date); })
        .y(function(d) { return $this.y1(d.value2); });


    //draw upper line1
    this.focus.append("path")
        .datum(this.curr_data1)
        .attr("class", "line1MAGA")
        .attr("fill", "none")
        .attr("stroke", "red")
        .attr("stroke-width", 1.5)
        .attr("d", this.line1MAGA) 
        // .on("mouseover",this.mouseover)
        // .on("mousemove", this.mousemove)
        // .on("mouseleave", this.mouseleave)   
        ;

    this.focus.append("path")
        .datum(this.curr_data1)
        .attr("class", "line1METOO")
        .attr("fill", "none")
        .attr("stroke", "steelblue")
        .attr("stroke-width", 1.5)
        .attr("d", this.line1METOO);        
  }

  drawLine2(){
    var $this = this;
    this.line2MAGA = d3.line()
        .x(function(d) { return $this.x2(d.date); })
        .y(function(d) { return $this.y2(d.value1); });

    this.line2METOO = d3.line()
        .x(function(d) { return $this.x2(d.date); })
        .y(function(d) { return $this.y2(d.value2); });

    this.context.append("path")
        .datum(this.curr_data1)
        .attr("class", "line2MAGA")
        .attr("fill", "none")
        .attr("stroke", "red")
        .attr("stroke-width", 1.5)
        .attr("d", this.line2MAGA);

    this.context.append("path")
        .datum(this.curr_data1)
        .attr("class", "line2METOO")
        .attr("fill", "none")
        .attr("stroke", "steelblue")
        .attr("stroke-width", 1.5)
        .attr("d", this.line2METOO);        
  }

  drawAxisX(){
    this.focus.append("g")
        .attr("class", "xaxis1")
        .attr("transform", "translate(0," + this.height + ")")
        .call(this.xAxis1);

    this.context.append("g")
        .attr("class", "xaxis2")
        .attr("transform", "translate(0," + this.height2 + ")")
        .call(this.xAxis2)
        //
        //  .on("mouseover", () => {console.log("yaaa")})
        // .on("mousemove", () => {console.log("yaaa")})
        // .on("mouseleave", () => {console.log("yaaa")})
        ;
  }


  drawAxisY(){
      this.focus.append("g")
        .attr("class", "yaxis")
        .call(this.yAxis);
  }

  addClip(){
    this.svg.append("defs").append("clipPath")
      .attr("id", "clip")
      .append("rect")
      .attr("width", this.width)
      .attr("height", this.height)
      .attr("x", 0)
      .attr("y", 0);
  }

  addBrush(){
    this.context.append("g")
        .attr("class", "brush")
        .call(this.brush)
        .call(this.brush.move, this.x1.range())
        ;
  }

  addZoom(){
    this.svg.append("rect")
        .attr("class", "zoom")
        .attr("width", this.width)
        .attr("height", this.height)
        .attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")")
        .call(this.zoom) 
        ;
  }

  brushed() {
  if (d3.event.sourceEvent && d3.event.sourceEvent.type === "zoom") return; // ignore brush-by-zoom
  this.s = d3.event.selection || this.x2.range();
  this.x1.domain(this.s.map(this.x2.invert, this.x2));
  this.focus.selectAll(".line1MAGA").attr("d", this.line1MAGA(this.curr_data1));
  this.focus.selectAll(".line1METOO").attr("d", this.line1METOO(this.curr_data1));
  this.focus.selectAll(".xaxis1").call(this.xAxis1);

  // Fix here
  // this.svg.selectAll(".zoom").call(this.zoom.transform, d3.zoomIdentity
  //     .scale(this.width / (this.s[1] - this.s[0]))
  //     .translate(-this.s[0], 0));
  this.brushed_flag = 1;
  }

  zoomed(){
    if (d3.event.sourceEvent && d3.event.sourceEvent.type === "brush") return; // ignore zoom-by-brush
    this.t = d3.event.transform;
    this.x1.domain(this.t.rescaleX(this.x2).domain());
    this.focus.selectAll(".line1MAGA").attr("d", this.line1MAGA(this.curr_data1));
     this.focus.selectAll(".line1METOO").attr("d", this.line1METOO(this.curr_data1));
    this.focus.selectAll(".xaxis1").call(this.xAxis1);
    this.context.selectAll(".brush").call(this.brush.move, this.x1.range().map(this.t.invertX, this.t));
    //context.select(".brush").call(brush.move, [x(60), x(120)]);
    this.zoomed_flag = 1;
  }


 // Update data section: the order of the functions calls are important
 update(new_data) {
    console.log(this.selected_date);

    // this.prev_s = this.s;
    // this.flag = 1;

    // Problem: changem zoom then brush => bug
    this.curr_data1 = new_data;

    // Scale the range of the data again 
    this.createXScaleAxis();
    this.createYScaleAxis();    
    this.createBrush();
    //this.createZoom();

    this.createToolTip();

    // Remain zoomed
    if(this.zoomed_flag == 1){
      this.x1.domain(this.t.rescaleX(this.x2).domain());
    }

    if(this.brushed_flag == 1){
      this.x1.domain(this.s.map(this.x2.invert, this.x2));
    }

    // Select the section we want to apply our changes to
    var svg = d3.selectAll('svg').transition();
    var focus = this.svg.selectAll(".focus").transition();
    var context = this.svg.selectAll(".context").transition();


    focus.select(".xaxis1") // change the y axis
            .duration(750)
            .call(this.xAxis1);

    // actually this never changes
    context.select(".xaxis2") 
            .duration(750)
            .call(this.xAxis2);

    focus.select(".yaxis") // change the y axis
            .duration(750)
            .call(this.yAxis);

    focus.select(".line1MAGA") // change the y axis
            .duration(750)
            .attr("fill", "none")
            .attr("stroke", "red")
            .attr("stroke-width", 1.5)
            .attr("d", this.line1MAGA(this.curr_data1));
    
    focus.select(".line1METOO") // change the y axis
            .duration(750)
            .attr("fill", "none")
            .attr("stroke", "steelblue")
            .attr("stroke-width", 1.5)
            .attr("d", this.line1METOO(this.curr_data1));

    context.select(".line2MAGA")
             .duration(750)
            .attr("fill", "none")
            .attr("stroke", "red")
            .attr("stroke-width", 1.5)
           .attr("d", this.line2MAGA(this.curr_data1));

    context.select(".line2METOO")
             .duration(750)
            .attr("fill", "none")
            .attr("stroke", "steelblue")
            .attr("stroke-width", 1.5)
             .attr("d", this.line2METOO(this.curr_data1));       
  } 

}


///////////////////////////////////////////////
// data loading and drawing <=> "main()" part of the function
var time_plot;
const model = new Model('data/clean_maga_011518_041418.json', 'data/clean_metoo_011518_041418.json');
model.loadData()
  .then(([data1, data2]) => {
    model.data1 = data1;
    model.data2 = data2;

    // Default View
    var repliesByDate = model.getRepliesByDate();
    var curr_data1 = repliesByDate;

    time_plot = new Plot(curr_data1);
    time_plot.draw();


    //debugging
    model.sortByLikes("2018-03-15");

});

d3.select('.controls').on('click', function() {
  d3.select(this).selectAll('button').classed('active', false);
  d3.select(d3.event.target).classed('active', true)
});
d3.select('#show-replies').on('click', showReplies);
d3.select('#show-retweets').on('click', showRetweets);
d3.select('#show-likes').on('click', showLikes);
d3.select('#show-ratio').on('click', showAggregateRatio);
d3.select('#show-total').on('click', showTotal);

function showReplies() {
  var new_data = model.getRepliesByDate();
  time_plot.update(new_data);
  return;
}

function showRetweets() {
  var new_data = model.getRetweetsByDate();
  time_plot.update(new_data);
  return;
}

function showLikes() {
  var new_data = model.getLikesByDate();
  time_plot.update(new_data);
  return;
}

function showAverageRatio() {
  var new_data = model.getAverageRatioByDate();
  time_plot.update(new_data);
  return;
}


function showAggregateRatio() {
  var new_data = model.getAggregateRatioByDate();
  time_plot.update(new_data);
  return;
}

function showTotal() {
  var new_data = model.getTotalByDate();
  time_plot.update(new_data);
  return;
}



