'use strict';

var parseDate = d3.timeParse("%Y-%m-%d");

class Model {
  constructor(dataSource) {
    this.dataSource = dataSource;
    this.data = [];

  }

  loadData() {
    return new Promise((resolve, reject) => {
      d3.json(this.dataSource, (error, data) => {
        if (error) {
          reject(error);
        } else {
          resolve(data);
        }
      });
    });
  }

  getTweetsByDate(){
    var tweetsByDate = d3.nest()
      .key(function(d) { return d.date; })
      .entries(this.data);

    tweetsByDate.forEach(function(d) {
     d.date = parseDate(d.key);
     d.value = d.value;
    });
    

    return tweetsByDate;
  }

  getLikesByDate(){
    var likesByDate = d3.nest()
      .key(function(d) { return d.date; })
      .rollup(function(v) { return d3.sum(v, function(d) { return d.likes; }); })
      .entries(this.data);

    likesByDate.forEach(function(d) {
     d.date = parseDate(d.key);
     d.value = d.value;
    });

    return likesByDate;    
  }

  getRetweetsByDate(){
    var retweetsByDate = d3.nest()
      .key(function(d) { return d.date; })
      .rollup(function(v) { return d3.sum(v, function(d) { return d.retweets; }); })
      .entries(this.data);

    retweetsByDate.forEach(function(d) {
     d.date = parseDate(d.key);
     d.value = d.value;
    });

    return retweetsByDate;    
  }


  getRepliesByDate(){
    var repliesByDate = d3.nest()
      .key(function(d) { return d.date; })
      .rollup(function(v) { return d3.sum(v, function(d) { return d.replies; }); })
      .entries(this.data);

    repliesByDate.forEach(function(d) {
     d.date = parseDate(d.key);
     d.value = d.value;
    });

    return repliesByDate;    
  }

  // Ratio is calculated as Average of Individual Tweet Ratio (Replies : Likes + Retweets)
  getAverageRatioByDate(){
    var averageratioByDate = d3.nest()
      .key(function(d) { return d.date; })
      .rollup(function(v) { return d3.mean(v, function(d) 
          { if ( (d.likes+d.retweets) == 0 ) return 0;
            else return d.replies/(d.likes+d.retweets); 
          }); 

                          })
      .entries(this.data);

    averageratioByDate.forEach(function(d) {
     d.date = parseDate(d.key);
     d.value = d.value;
    });

    return averageratioByDate;    
  }


  // Ratio is calculated as Average of Individual Tweet Ratio (Replies : Likes + Retweets)
  getAggregateRatioByDate(){
    var aggregateratioByDate = d3.nest()
      .key(function(d) { return d.date; })
      .rollup(function(v) 
            { 
              return d3.sum(v, function(d) { return d.replies})/
                (d3.sum(v, function(d) { return d.likes})
                +d3.sum(v, function(d) { return d.retweets})); 
            })
      .entries(this.data);

    aggregateratioByDate.forEach(function(d) {
     d.date = parseDate(d.key);
     d.value = d.value;
    });

    return aggregateratioByDate;    
  }

  getTotalByDate(){
    var totalByDate = d3.nest()
      .key(function(d) { return d.date; })
      .rollup(function(v) { return d3.sum(v, function(d) { return d.replies + d.retweets + d.likes; }); })
      .entries(this.data);

    totalByDate.forEach(function(d) {
     d.date = parseDate(d.key);
     d.value = d.value;
    });

    return totalByDate;    
  }

  // tweet_dic['id'] = i_d
  // tweet_dic['tweeter'] = tweeter
  // tweet_dic['content'] = content
  // tweet_dic['replies'] = replies
  // tweet_dic['retweets'] = retweets
  // tweet_dic['likes'] = likes
  // tweet_dic['date'] = d1



}


// ////////////

// // data loading and drawing
// d3.json("clean_maga_011518_041418.json", type, function(error, data) {
//   if (error) throw error;

//   // tweet_dic['id'] = i_d
//   // tweet_dic['tweeter'] = tweeter
//   // tweet_dic['content'] = content
//   // tweet_dic['replies'] = replies
//   // tweet_dic['retweets'] = retweets
//   // tweet_dic['likes'] = likes
//   // tweet_dic['date'] = d1

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
