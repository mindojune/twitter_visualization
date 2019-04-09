'use strict';

// TODO 1: Smart Computation of Upset Plot

class Plot {
  constructor(curr_data1, model) {
      this.svg = d3.select("#time_series1");

      // this.margin  = {top: 20, bottom: 110, right: 20,  left: 80};
      // this.margin2 = {top: 430, bottom: 30, right: 20,  left: 80};
      // this.margin3 = {top: 430, bottom: 30, right: 20,  left: 80};
      // this.width = +this.svg.attr("width") - this.margin.left - this.margin.right;      // 900
      // this.height = +this.svg.attr("height")/(2) - this.margin.top - this.margin.bottom;    // 370
      // this.height2 = +this.svg.attr("height")/(2) - this.margin2.top - this.margin2.bottom; // 40
      // this.height3 = +this.svg.attr("height") -this.margin3.top - this.margin3.bottom ; // 40
      
      this.margin  = {top: 20, bottom: 110, right: 20,  left: 80};
      this.margin2 = {top: 430, bottom: 30, right: 20,  left: 80};
      this.width = + this.svg.attr("width") -  this.margin.left - this.margin.right,
      this.height = + this.svg.attr("height") - this.margin.top - this.margin.bottom,
      this.height2 = + this.svg.attr("height") - this.margin2.top - this.margin2.bottom;
      
      this.parseDate = d3.timeParse("%Y-%m-%d");
      
      this.curr_data1 = curr_data1;

      this.selected_date = -1;
      // Ignore those but don't delete
      this.zoomed_flag = 0;
      this.brushed_flag = 0;

      this.model = model;
      this.displaying = "replies";
      // "retweets", "likes", "total", "ratio"

      //this.upsetMAGA = true;
  } 

  draw() {
    this.createXScaleAxis();
    this.createYScaleAxis();    
    this.createBrush();
    //this.createZoom(); // can be optional

    //this.fillTweets();
    this.initiateTweets();

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

    // true = MAGA default, false = METOO default
    this.drawUpset(false);
  }

  fillTweets(magaTweet, metooTweet){
      var magaUser = magaTweet[0];
      var metooUser = metooTweet[0];
      var magaUID = magaTweet[1];
      var metooUID =metooTweet[1];
      var magaTime= magaTweet[2];
      var metooTime = metooTweet[2];
      var magaText= magaTweet[3];
      var metooText =metooTweet[3];

      this.maga = d3.select('#tweetMAGA');
      this.metoo = d3.select('#tweetMETOO');

      //console.log(this.maga)
      this.maga.select(".tweetEntry-fullname").text(magaUser);
      this.maga.select(".tweetEntry-username").text(magaUID);
      this.maga.select(".tweetEntry-timestamp").text(magaTime);
      this.maga.select(".tweetEntry-text-container").text(magaText);

      this.metoo.select(".tweetEntry-fullname").text(metooUser);
      this.metoo.select(".tweetEntry-username").text(metooUID);
      this.metoo.select(".tweetEntry-timestamp").text(metooTime);
      this.metoo.select(".tweetEntry-text-container").text(metooText);
  }

  initiateTweets(){
      this.maga = d3.select('#tweetMAGA');
      this.metoo = d3.select('#tweetMETOO');

      //console.log(this.maga)
      this.maga.select(".tweetEntry-fullname").text("Donald J. Trump");
      this.maga.select(".tweetEntry-username").text("@realDonaldTrump");
      this.maga.select(".tweetEntry-timestamp").text("8:09 AM - 21 Feb 2019");
      this.maga.select(".tweetEntry-text-container").text(".@JussieSmollett - what about MAGA and the tens of millions of people you insulted with your racist and dangerous comments!? #MAGA");

      this.metoo.select(".tweetEntry-fullname").text("Alyssa Milano");
      this.metoo.select(".tweetEntry-username").text("@Alyssa_Milano");
      this.metoo.select(".tweetEntry-timestamp").text("1:21 PM - 15 Oct 2017");
      this.metoo.select(".tweetEntry-text-container").text("If you’ve been sexually harassed or assaulted write ‘me too’ as a reply to this tweet.");
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

  static textProcess(original){
    var words = original.split(" ");
    var new_string = "";

    for (var i = 0; i < words.length; i++) { 
      if(words[i].length > 30){
        //console.log(words[i].match(/.{1,10}/g));
        var equal_length = words[i].match(/.{1,15}/g);
        for (var j = 0; j < equal_length.length; j++) { 
          new_string += equal_length[j] + " ";
        }
      }
      else{
        new_string += words[i] + " ";
      }
      
    }

    return new_string;
  }

  createToolTip(){
    
    const tooltip1 = d3.select('body').append('div').attr("class", "tooltip1").style("opacity", 0.0);
    const tooltip2 = d3.select('body').append('div').attr("class", "tooltip2").style("opacity", 0.0);
    //const tooltip = this.focus.append('text'); //.attr("class", "tooltip").style("opacity", 1);
    const tooltipLine = this.focus.append('line');

    var x1 = this.x1;
    var y1 = this.y1;

    this.removeTooltip = function() {
          if (tooltip1) 
            //tooltip.style("display", "none");
            tooltip1.style("visibility", "hidden");
          if (tooltip2) 
            tooltip2.style("visibility", "hidden");
          if (tooltipLine) 
            tooltipLine.attr('stroke', 'none');
        }

    var width = this.width;
    var height =this.height;
    var $this = this;

    this.mouseover = function(){
        tooltip1.style("visibility", "visible");
        tooltip2.style("visibility", "visible");
    }

    this.drawTooltip = function() {
            var xm = x1.invert(d3.mouse(this)[0]); // THIS IS CORRECT
            var ym = y1.invert(d3.mouse(this)[1]); // THIS IS CORRECT

            const date = d3.timeFormat("%Y-%m-%d")(xm);
            
            $this.selected_date = date;
            var res = $this.getTopTweet(date);

            var topTweeterMAGA = res[0][0];
            var topTweeterMETOO = res[1][0];    

            var topTweetMAGA = Plot.textProcess(res[0][3]);
            var topTweetMETOO = Plot.textProcess(res[1][3]);   

            var xpos = d3.mouse(this)[0] ;
            var ypos = d3.mouse(this)[1] ;
            

            tooltipLine.attr('stroke', 'black')
                .attr("stroke-width", 2.5)
                .attr("x1", xpos)
                .attr("x2", xpos)
                .attr('y1', 0)
                .attr('y2', height);    


            // tooltip1.transition()     
            //     //.style("visibility", "visible")
            //     .duration(200)      
            //     .style("opacity", .8);      
            // tooltip1.html("MAGA TOP Tweet")  
            //     .text(topTweeterMAGA+": "+topTweetMAGA)
            //     .attr("font-family", "noto")
            //     .attr("font-size", "10px")
            //     .style("left", (d3.event.pageX) + "px")     
            //     .style("top", (d3.event.pageY - 28) + "px");    
 
            //  tooltip2.transition()     
            //     //.style("visibility", "visible")
            //     .duration(200)      
            //     .style("opacity", .8);      
            // tooltip2.html("METOO TOP Tweet")  
            //     .text(topTweeterMETOO+": "+topTweetMETOO)
            //     .attr("font-family", "noto")
            //     .attr("font-size", "10px")
            //     .style("left", (d3.event.pageX + 150) + "px")     
            //     .style("top", (d3.event.pageY - 28) + "px");    
                                   
            var magaTweet = [topTweeterMAGA, topTweeterMAGA, res[0][2], topTweetMAGA];
            var metooTweet = [topTweeterMETOO, topTweeterMETOO, res[1][2], topTweetMETOO];
            $this.fillTweets(magaTweet, metooTweet);
            //console.log("METOO TOP TWEET", topTweetMETOO, "by", topTweeterMETOO);
            //console.log("MAGA TOP TWEET", topTweetMAGA, "by", topTweeterMAGA);


    }

    this.tipBox = this.focus.append('rect')
        .attr('width', width)
        .attr('height', height)
        .attr('opacity', 0)
        .on('mousemove', this.drawTooltip)
        .on('mouseover', this.mouseover)
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

  this.start_end =  this.s.map(this.x2.invert, this.x2);

  // Fix here
  // this.svg.selectAll(".zoom").call(this.zoom.transform, d3.zoomIdentity
  //     .scale(this.width / (this.s[1] - this.s[0]))
  //     .translate(-this.s[0], 0));
  this.brushed_flag = 1;

  // For updating drawUpset
  //this.drawUpset();
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

  getTopTweet(date){
    // console.log(this.displaying);
    // console.log(date);
    var content1, content2, tweeter1, tweeter2, time1, time2, id1, id2;
    var res;
    var MAGA, METOO;
    if (this.displaying == "replies"){
        res = this.model.sortByReplies(date);
    }
    else if(this.displaying == "retweets"){
        res = this.model.sortByRetweets(date);
    }
    else if(this.displaying == "likes"){
        res = this.model.sortByLikes(date);
    }
    else if(this.displaying == "total"){
        res = this.model.sortByTotal(date);
    }
    else if(this.displaying == "ratio"){
        res = this.model.sortByRatio(date);
        //res = this.model.sortByAverageRatio(date);
    }
    MAGA = res[0];
    METOO = res[1];

    content1 = MAGA[0].content;
    tweeter1 = MAGA[0].tweeter;
    time1 = MAGA[0].date;
    id1 = MAGA[0].tweeter;


    content2 = METOO[0].content;
    tweeter2 = METOO[0].tweeter;
    time2 = METOO[0].date;
    id2 = METOO[0].tweeter;

    return [[tweeter1, id1, time1, content1], [tweeter2, id2, time2, content2] ];
  }

  drawUpset(maga) {
    // makeUpset(sets,names);
    // change date to date range later
    
    //var date = '2018-04-04'
    //var title = this.start_end[0].toString().slice(0,17) + " - " + this.start_end[1].toString().slice(0,17);
    

    // var filter_date = this.selected_date;

    // if(this.selected_date == -1) filter_date = '2018-04-04';
    // var title = filter_date;

    var startTime, endTime;
    startTime = new Date();

    var title = this.start_end[0].toString().slice(0,15) + " - " + this.start_end[1].toString().slice(0,15);
    var filename;
    var color;



    //if(maga){
      var filenameMAGA = 'data/clean_maga_011518_041418.json'
      var titleMAGA = title + " #MAGA Tweets";
      var colorMAGA = "red";
    //}
    //else{
      var filenameMETOO = 'data/clean_metoo_011518_041418.json'
      var titleMETOO = title + " #METOO Tweets";
      var colorMETOO = "steelblue";
    //}

    d3.json(filenameMAGA,(d) => {
        var dat = d;
            // filter by date first then
        var fltrdData = dat.filter((d) => this.parseDate(d.date)>=this.start_end[0] && this.parseDate(d.date) <= this.start_end[1]);
        
        //var fltrdData = dat.filter((d) => d.date == this.selected_date);
        
        var allHts = [];
        var htCounter = {};
        fltrdData.forEach((item) => {
            allHts = allHts.concat(item.hashtags);
        });

        // Filtering "" results: Is doing this necessary or truthful?
        allHts = allHts.filter((d) => d !== "");

        allHts.forEach((ht) => {
            if (!(ht in htCounter)) {
                htCounter[ht] = 1
            } else {
                htCounter[ht] += 1
            }
        });

        var setsAll = Object.keys(htCounter).sort(function(a,b) {
            return htCounter[b]-htCounter[a]
        });
        //var sets = setsAll.slice(0,5);
        var sets = setsAll.slice(1,6);

        // names = [for ht in sets, array of all tweet ids with ht in ht]
        var names = [];
        sets.forEach ((ht) => {
            var idList = [];
            fltrdData.forEach((item) => {
                if (item.hashtags.includes(ht)) {
                    idList.push(item.id)
                }
            });
            names.push(idList);
        });
        makeUpset(sets,names, titleMAGA, colorMAGA, "#venn1");
        //updateUpset(sets,names, title, color);
    });

    d3.json(filenameMETOO,(d) => {
        var dat = d;
            // filter by date first then
        var fltrdData = dat.filter((d) => this.parseDate(d.date)>=this.start_end[0] && this.parseDate(d.date) <= this.start_end[1]);
        
        //var fltrdData = dat.filter((d) => d.date == this.selected_date);
        
        var allHts = [];
        var htCounter = {};
        fltrdData.forEach((item) => {
            allHts = allHts.concat(item.hashtags);
        });

        // Filtering "" results: Is doing this necessary or truthful?
        allHts = allHts.filter((d) => d !== "");

        allHts.forEach((ht) => {
            if (!(ht in htCounter)) {
                htCounter[ht] = 1
            } else {
                htCounter[ht] += 1
            }
        });

        var setsAll = Object.keys(htCounter).sort(function(a,b) {
            return htCounter[b]-htCounter[a]
        });
        //var sets = setsAll.slice(0,5);
        var sets = setsAll.slice(1,6);

        // names = [for ht in sets, array of all tweet ids with ht in ht]
        var names = [];
        sets.forEach ((ht) => {
            var idList = [];
            fltrdData.forEach((item) => {
                if (item.hashtags.includes(ht)) {
                    idList.push(item.id)
                }
            });
            names.push(idList);
        });
        //makeUpset(sets,names, titleMETOO, colorMETOO, "#venn1"); //
        makeUpset(sets,names, titleMETOO, colorMETOO, "#venn2");
        //updateUpset(sets,names, title, color);
    });

    // endTime = new Date();
    // var timeDiff = endTime - startTime; //in ms
    // timeDiff /= 1000;
    // var seconds = Math.round(timeDiff);
    // console.log("Took " + seconds + " seconds");
    // console.log(timeDiff);
  }


  updateUpset(maga) {
    // makeUpset(sets,names);
    // change date to date range later
    
    //var date = '2018-04-04'
    //var title = this.start_end[0].toString().slice(0,17) + " - " + this.start_end[1].toString().slice(0,17);
    

    // var filter_date = this.selected_date;

    // if(this.selected_date == -1) filter_date = '2018-04-04';
    // var title = filter_date;


    var title = this.start_end[0].toString().slice(0,15) + " - " + this.start_end[1].toString().slice(0,15);
    var filename;
    var color;


    //if(maga){
      var filenameMAGA = 'data/clean_maga_011518_041418.json'
      var titleMAGA = title + " #MAGA Tweets";
      var colorMAGA = "red";
    //}
    //else{
      var filenameMETOO = 'data/clean_metoo_011518_041418.json'
      var titleMETOO = title + " #METOO Tweets";
      var colorMETOO = "steelblue";
    //}

    d3.json(filenameMAGA,(d) => {
        var dat = d;
            // filter by date first then
        var fltrdData = dat.filter((d) => this.parseDate(d.date)>=this.start_end[0] && this.parseDate(d.date) <= this.start_end[1]);
        
        //var fltrdData = dat.filter((d) => d.date == this.selected_date);
        
        var allHts = [];
        var htCounter = {};
        fltrdData.forEach((item) => {
            allHts = allHts.concat(item.hashtags);
        });

        // Filtering "" results: Is doing this necessary or truthful?
        allHts = allHts.filter((d) => d !== "");

        allHts.forEach((ht) => {
            if (!(ht in htCounter)) {
                htCounter[ht] = 1
            } else {
                htCounter[ht] += 1
            }
        });

        var setsAll = Object.keys(htCounter).sort(function(a,b) {
            return htCounter[b]-htCounter[a]
        });
        //var sets = setsAll.slice(0,5);
        var sets = setsAll.slice(1,6);

        // names = [for ht in sets, array of all tweet ids with ht in ht]
        var names = [];
        sets.forEach ((ht) => {
            var idList = [];
            fltrdData.forEach((item) => {
                if (item.hashtags.includes(ht)) {
                    idList.push(item.id)
                }
            });
            names.push(idList);
        });
        updateUpset(sets,names, titleMAGA, colorMAGA, "#venn1");
        //updateUpset(sets,names, title, color);
    });

    d3.json(filenameMETOO,(d) => {
        var dat = d;
            // filter by date first then
        var fltrdData = dat.filter((d) => this.parseDate(d.date)>=this.start_end[0] && this.parseDate(d.date) <= this.start_end[1]);
        
        //var fltrdData = dat.filter((d) => d.date == this.selected_date);
        
        var allHts = [];
        var htCounter = {};
        fltrdData.forEach((item) => {
            allHts = allHts.concat(item.hashtags);
        });

        // Filtering "" results: Is doing this necessary or truthful?
        allHts = allHts.filter((d) => d !== "");

        allHts.forEach((ht) => {
            if (!(ht in htCounter)) {
                htCounter[ht] = 1
            } else {
                htCounter[ht] += 1
            }
        });

        var setsAll = Object.keys(htCounter).sort(function(a,b) {
            return htCounter[b]-htCounter[a]
        });
        //var sets = setsAll.slice(0,5);
        var sets = setsAll.slice(1,6);

        // names = [for ht in sets, array of all tweet ids with ht in ht]
        var names = [];
        sets.forEach ((ht) => {
            var idList = [];
            fltrdData.forEach((item) => {
                if (item.hashtags.includes(ht)) {
                    idList.push(item.id)
                }
            });
            names.push(idList);
        });
        //updateUpset(sets,names, titleMETOO, colorMETOO, "#venn1"); //
        updateUpset(sets,names, titleMETOO, colorMETOO, "#venn2");
        //updateUpset(sets,names, title, color);
    });


  }

 // Update data section: the order of the functions calls are important
 update(new_data) {
    
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
    var svg = d3.select('#time_series1').transition();
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

    //this.drawUpset(); 
  } 

  
}


///////////////////////////////////////////////
// data loading and drawing <=> "main()" part of the function
var time_plot;
var model = new Model('data/clean_maga_011518_041418.json', 'data/clean_metoo_011518_041418.json');
model.loadData()
  .then(([data1, data2]) => {
    model.data1 = data1;
    model.data2 = data2;

    // Default View
    var repliesByDate = model.getRepliesByDate();
    var curr_data1 = repliesByDate;

    time_plot = new Plot(curr_data1, model);
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
d3.select('#show-hb').on('click', updateUpsetMAGA);
d3.select('#align').on('click', align);
d3.select('#dealign').on('click', dealign);
// d3.select('#show-hbMETOO').on('click', updateUpsetMETOO);

function showReplies() {
  var new_data = model.getRepliesByDate();
  time_plot.update(new_data);
  time_plot.displaying = "replies";

  return;
}

function showRetweets() {
  var new_data = model.getRetweetsByDate();
  time_plot.update(new_data);

  time_plot.displaying = "retweets";

  return;
}

function showLikes() {
  var new_data = model.getLikesByDate();
  time_plot.update(new_data);
  
  time_plot.displaying = "likes";
  return;
}

function showAverageRatio() {
  var new_data = model.getAverageRatioByDate();
  time_plot.update(new_data);

  time_plot.displaying = "ratio";
  return;
}


function showAggregateRatio() {
  var new_data = model.getAggregateRatioByDate();
  time_plot.update(new_data);

  time_plot.displaying = "ratio";
  return;
}

function showTotal() {
  var new_data = model.getTotalByDate();
  time_plot.update(new_data);

  time_plot.displaying = "total";
  return;
}

function updateUpsetMAGA() {
  time_plot.updateUpset(true);
  return;
}

function updateUpsetMETOO() {
  time_plot.updateUpset(false);
  return;
}


function align() {
  //time_plot.updateUpset(false);
  model = new Model('data/maga_dayofyear_061515_121515.json', 'data/metoo_dayofyear_101417_041418.json');
  model.loadData()
    .then(([data1, data2]) => {
      model.data1 = data1;
      model.data2 = data2;

      // Default View
      var repliesByDate = model.getRepliesByDate();
      var curr_data1 = repliesByDate;

      time_plot.update(curr_data1);
      time_plot.displaying = "replies";
      // time_plot = new Plot(curr_data1, model);
      // time_plot.draw();
  });
  return;
}



function dealign() {
  //time_plot.updateUpset(false);
  model = new Model('data/clean_maga_011518_041418.json', 'data/clean_metoo_011518_041418.json');
  model.loadData()
    .then(([data1, data2]) => {
      model.data1 = data1;
      model.data2 = data2;

      // Default View
      var repliesByDate = model.getRepliesByDate();
      var curr_data1 = repliesByDate;

      time_plot.update(curr_data1);
      time_plot.displaying = "replies";
      //time_plot = new Plot(curr_data1, model);
      //time_plot.draw();
  });
  return;
}





