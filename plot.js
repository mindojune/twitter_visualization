'use strict';

// TODO 1: http://bl.ocks.org/d3noob/7030f35b72de721622b8 make it work
// TODO 2: Idea for Bottom Aggregate Visualization

class Plot {
  constructor(curr_data) {
      this.svg = d3.selectAll("svg");

      this.margin  = {top: 20, bottom: 110, right: 20,  left: 80};
      this.margin2 = {top: 430, bottom: 30, right: 20,  left: 80};
      this.margin3 = {top: 430, bottom: 30, right: 20,  left: 80};
      this.width = +this.svg.attr("width") - this.margin.left - this.margin.right;      // 900
      this.height = +this.svg.attr("height")/(2) - this.margin.top - this.margin.bottom;    // 370
      this.height2 = +this.svg.attr("height")/(2) - this.margin2.top - this.margin2.bottom; // 40
      this.height3 = +this.svg.attr("height") -this.margin3.top - this.margin3.bottom ; // 40
      this.parseDate = d3.timeParse("%Y-%m-%d");
      this.curr_data = curr_data;

      this.zoomed_flag = 0;
  } 

  draw() {
    this.createXScaleAxis();
    this.createYScaleAxis();    
    this.createBrush();
    this.createZoom();

    this.drawFocus();
    this.drawContext();
    this.drawLine1();
    this.drawLine2();
    this.drawAxisX();
    this.drawAxisY();    

    this.addClip();
    this.addBrush();
    this.addZoom();

  }



  createXScaleAxis() {
      this.x1 = d3.scaleTime().range([0, this.width]);
      this.x2 = d3.scaleTime().range([0, this.width]);
      this.xAxis1 = d3.axisBottom(this.x1);
      this.xAxis2 = d3.axisBottom(this.x2);
      this.x1.domain(d3.extent(this.curr_data, function(d) { return d.date; }));  
      this.x2.domain(this.x1.domain());

  }

  createYScaleAxis() {
      this.y1 = d3.scaleLinear().range([this.height, 0]),
      this.y2 = d3.scaleLinear().range([this.height2, 0]);
      this.yAxis = d3.axisLeft(this.y1);
      this.y1.domain([0, d3.max(this.curr_data, function(d) { return d.value; })]);
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

  drawFocus(){
    this.focus = this.svg.selectAll('.focus');

    //this.focus.remove(); //

    this.focus = this.svg.append("g")
        .attr("class", "focus")
        .attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")");
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

    this.line1 = d3.line()
        .x(function(d) { return $this.x1(d.date); })
        .y(function(d) { return $this.y1(d.value); });


    //draw upper line1
    this.focus.append("path")
        .datum(this.curr_data)
        .attr("class", "line")
        .attr("fill", "none")
        .attr("stroke", "steelblue")
        .attr("stroke-width", 1.5)
        //.attr("clip-path", "url(#clip)") // no need (done in css)
        .attr("d", this.line1);

  }

  drawLine2(){
    var $this = this;
    this.line2 = d3.line()
        .x(function(d) { return $this.x2(d.date); })
        .y(function(d) { return $this.y2(d.value); });

    this.context.append("path")
        .datum(this.curr_data)
        .attr("class", "line")
        .attr("fill", "none")
        .attr("stroke", "steelblue")
        .attr("stroke-width", 1.5)
        .attr("d", this.line2);

  }

  drawAxisX(){
    this.focus.append("g")
        .attr("class", "xaxis1")
        .attr("transform", "translate(0," + this.height + ")")
        .call(this.xAxis1);

    this.context.append("g")
        .attr("class", "xaxis2")
        .attr("transform", "translate(0," + this.height2 + ")")
        .call(this.xAxis2);
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
        .call(this.brush.move, this.x1.range());
  }

  addZoom(){

    this.svg.append("rect")
        .attr("class", "zoom")
        .attr("width", this.width)
        .attr("height", this.height)
        .attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")")
        .call(this.zoom);
  }

  brushed() {
  if (d3.event.sourceEvent && d3.event.sourceEvent.type === "zoom") return; // ignore brush-by-zoom
  this.s = d3.event.selection || this.x2.range();
  this.x1.domain(this.s.map(this.x2.invert, this.x2));
  this.focus.select(".line").attr("d", this.line1(this.curr_data));
  this.focus.select(".xaxis1").call(this.xAxis1);

  // Fix here
  this.svg.select(".zoom").call(this.zoom.transform, d3.zoomIdentity
      .scale(this.width / (this.s[1] - this.s[0]))
      .translate(-this.s[0], 0));
  }

  zoomed(){
    if (d3.event.sourceEvent && d3.event.sourceEvent.type === "brush") return; // ignore zoom-by-brush
    this.t = d3.event.transform;
    this.x1.domain(this.t.rescaleX(this.x2).domain());
    this.focus.select(".line").attr("d", this.line1(this.curr_data));
    this.focus.select(".xaxis1").call(this.xAxis1);
    this.context.select(".brush").call(this.brush.move, this.x1.range().map(this.t.invertX, this.t));
    //context.select(".brush").call(brush.move, [x(60), x(120)]);
    this.zoomed_flag = 1;
  }


 // ** Update data section (Called from the onclick)
 update(new_data) {
    // this.prev_s = this.s;
    // this.flag = 1;

    // Problem: changem zoom then brush => bug
    this.curr_data = new_data;

    // Scale the range of the data again 
    this.createXScaleAxis();
    this.createYScaleAxis();    
    this.createBrush();
    this.createZoom();



    // Remain zoomed
    if(this.zoomed_flag == 1){
      this.x1.domain(this.t.rescaleX(this.x2).domain());
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

    focus.select(".line") // change the y axis
            .duration(750)
            .attr("fill", "none")
            .attr("stroke", "steelblue")
            .attr("stroke-width", 1.5)
            //.attr("clip-path", "url(#clip)") // no need (done in css)
            .attr("d", this.line1(this.curr_data));

    context.select(".line")
             .duration(750)
            .attr("fill", "none")
            .attr("stroke", "steelblue")
            .attr("stroke-width", 1.5)
           .attr("d", this.line2(this.curr_data));


  } 


}


///////////////////////////////////////////////
// data loading and drawing <=> "main()" part of the function
var time_plot;
const model = new Model('data/clean_maga_011518_041418.json');
model.loadData()
  .then((data) => {
    model.data = data;

    var tweetsByDate = model.getTweetsByDate();
    //console.log(JSON.stringify(tweetsByDate));
    var likesByDate = model.getRepliesByDate();

    var curr_data = likesByDate;

    time_plot = new Plot(curr_data);
    time_plot.draw();

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
  // time_plot.curr_data = model.getRepliesByDate();
  // time_plot.draw();

  var new_data = model.getRepliesByDate();
  time_plot.update(new_data);

  return;
}

function showRetweets() {
  // time_plot.curr_data = model.getRetweetsByDate();
  // time_plot.draw();

  var new_data = model.getRetweetsByDate();
  time_plot.update(new_data);


  return;
}

function showLikes() {
  // time_plot.curr_data = model.getLikesByDate();
  // time_plot.draw();


  var new_data = model.getLikesByDate();
  time_plot.update(new_data);



  return;
}

function showAverageRatio() {
  // time_plot.curr_data = model.getAverageRatioByDate();
  // time_plot.draw();

  var new_data = model.getAverageRatioByDate();
  time_plot.update(new_data);

  return;
}


function showAggregateRatio() {
  // time_plot.curr_data = model.getAggregateRatioByDate();
  // time_plot.draw();

  var new_data = model.getAggregateRatioByDate();
  time_plot.update(new_data);



  return;
}

function showTotal() {
  // time_plot.curr_data = model.getTotalByDate();
  // time_plot.draw();

  var new_data = model.getTotalByDate();
  time_plot.update(new_data);

  return;
}



