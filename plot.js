'use strict';

class Plot {
  constructor(curr_data) {
      this.svg = d3.select("svg"),
      // margin  = {top: 20, bottom: 110, right: 20,  left: 40},
      // margin2 = {top: 430, bottom: 30, right: 20,  left: 40},
      // width = +svg.attr("width") - margin.left - margin.right,
      // height = +svg.attr("height") - margin.top - margin.bottom,
      // height2 = +svg.attr("height") - margin2.top - margin2.bottom;

      this.margin  = {top: 20, bottom: 110, right: 20,  left: 50};
      this.margin2 = {top: 430, bottom: 30, right: 20,  left: 50};
      this.margin3 = {top: 430, bottom: 30, right: 20,  left: 50};
      this.width = +this.svg.attr("width") - this.margin.left - this.margin.right;      // 900
      this.height = +this.svg.attr("height")/(2) - this.margin.top - this.margin.bottom;    // 370
      this.height2 = +this.svg.attr("height")/(2) - this.margin2.top - this.margin2.bottom; // 40
      this.height3 = +this.svg.attr("height") -this.margin3.top - this.margin3.bottom ; // 40
      this.parseDate = d3.timeParse("%Y-%m-%d");
      this.curr_data = curr_data;

  } 

  draw() {

    this.createXScaleAxis();
    this.createYScaleAxis();    
    this.createBrush();
    this.createZoom();
    this.createFocus();
    this.createContext();

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
      this.xAxis = d3.axisBottom(this.x1);
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


  createFocus(){
    this.focus = this.svg.append("g")
        .attr("class", "focus")
        .attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")");
  }

  createContext(){
    this.context = this.svg.append("g")
        .attr("class", "context")
        .attr("transform", "translate(" + this.margin2.left + "," + this.margin2.top + ")");
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
        .attr("class", "axis axis--x")
        .attr("transform", "translate(0," + this.height + ")")
        .call(this.xAxis);

    this.context.append("g")
        .attr("class", "axis axis--x")
        .attr("transform", "translate(0," + this.height2 + ")")
        .call(this.xAxis2);
  }


  drawAxisY(){
      this.focus.append("g")
        .attr("class", "axis axis--y")
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
  this.focus.select(".line").attr("d", this.line1);
  this.focus.select(".axis--x").call(this.xAxis);
  this.svg.select(".zoom").call(this.zoom.transform, d3.zoomIdentity
      .scale(this.width / (this.s[1] - this.s[0]))
      .translate(-this.s[0], 0));
  }

  zoomed(){
    if (d3.event.sourceEvent && d3.event.sourceEvent.type === "brush") return; // ignore zoom-by-brush
    this.t = d3.event.transform;
    this.x1.domain(this.t.rescaleX(this.x2).domain());
    this.focus.select(".line").attr("d", this.line1);
    this.focus.select(".axis--x").call(this.xAxis);
    this.context.select(".brush").call(this.brush.move, this.x1.range().map(this.t.invertX, this.t));
    //context.select(".brush").call(brush.move, [x(60), x(120)]);
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
    var likesByDate = model.getLikesByDate();

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
d3.select('#show-ratio').on('click', showRatio);



function showReplies() {
  return;
}

function showRetweets() {
  return;
}

function showLikes() {
  return;
}

function showRatio() {
  return;
}

// d3.csv("ex_time.csv", type, function(error, data) {
//   if (error) throw error;

//   // set domains
//   x.domain(d3.extent(data, function(d) { return d.date; }));
//   y.domain([0, d3.max(data, function(d) { return d.price; })]);
//   x2.domain(x.domain());
//   y2.domain(y.domain());

//   //draw upper line1
//   focus.append("path")
//       .datum(data)
//       .attr("class", "line")
//       .attr("fill", "none")
//       .attr("stroke", "steelblue")
//       .attr("stroke-width", 1.5)
//       //.attr("clip-path", "url(#clip)") // no need (done in css)
//       .attr("d", line);

//   focus.append("g")
//       .attr("class", "axis axis--x")
//       .attr("transform", "translate(0," + height + ")")
//       .call(xAxis);

//   focus.append("g")
//       .attr("class", "axis axis--y")
//       .call(yAxis);

//   context.append("path")
//       .datum(data)
//       .attr("class", "line")
//       .attr("fill", "none")
//       .attr("stroke", "steelblue")
//       .attr("stroke-width", 1.5)
//       .attr("d", line2);

//   context.append("g")
//       .attr("class", "axis axis--x")
//       .attr("transform", "translate(0," + height2 + ")")
//       .call(xAxis2);

//   context.append("g")
//       .attr("class", "brush")
//       .call(brush)
//       .call(brush.move, x.range());

//   svg.append("rect")
//       .attr("class", "zoom")
//       .attr("width", width)
//       .attr("height", height)
//       .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
//       .call(zoom);
// });


