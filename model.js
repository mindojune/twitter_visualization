'use strict';

var parseDate = d3.timeParse("%Y-%m-%d");

class Model {
  constructor(dataSource_MAGA, dataSource_METOO) {
    this.dataSource_MAGA = dataSource_MAGA;
    this.dataSource_METOO = dataSource_METOO;
    this.data1 = [];
    this.data2 = [];
  }

  loadData() {
    return new Promise((resolve, reject) => {
      d3.json(this.dataSource_MAGA, (error1, data1) => {
        if (error1) {
          reject(error1);
        } else {
          //resolve(data1);
          d3.json(this.dataSource_METOO, (error2, data2) => {
              if (error2){
                reject(error2)
              } else {
                resolve([data1,data2])
              }

          })
        }
      })
    });

  }

  // TODO: Rightnow METOO date is clipped to MAGA's?

  getTweetsByDate(){
    var tweetsByDate = d3.nest()
      .key(function(d) { return d.date; })
      .entries(this.data1);

    var tweetsByDate_METOO = d3.nest()
      .key(function(d) { return d.date; })
      .entries(this.data2);  

    tweetsByDate.forEach(function(d) {
      var result = tweetsByDate_METOO.filter(function(METOO){
          return d.key == METOO.key;
      });
       d.date = parseDate(d.key);
       d.value1 = d.value;
       d.value2 = (result[0] !== undefined) ? result[0].value : null;
       delete d.value;
    });
    
    return tweetsByDate;
  }

  getLikesByDate(){
    var likesByDate = d3.nest()
      .key(function(d) { return d.date; })
      .rollup(function(v) { return d3.sum(v, function(d) { return d.likes; }); })
      .entries(this.data1);


    var likesByDate_METOO = d3.nest()
      .key(function(d) { return d.date; })
      .rollup(function(v) { return d3.sum(v, function(d) { return d.likes; }); })
      .entries(this.data2);    

    likesByDate.forEach(function(d) {
          var result = likesByDate_METOO.filter(function(METOO){
          return d.key == METOO.key;
      });
     d.date = parseDate(d.key);
     d.value1 = d.value;
     d.value2 = (result[0] !== undefined) ? result[0].value : null;
    });
    return likesByDate;    
  }

  getRetweetsByDate(){
    var retweetsByDate = d3.nest()
      .key(function(d) { return d.date; })
      .rollup(function(v) { return d3.sum(v, function(d) { return d.retweets; }); })
      .entries(this.data1);


    var retweetsByDate_METOO = d3.nest()
      .key(function(d) { return d.date; })
      .rollup(function(v) { return d3.sum(v, function(d) { return d.retweets; }); })
      .entries(this.data2);    

    retweetsByDate.forEach(function(d) {
          var result = retweetsByDate_METOO.filter(function(METOO){
          return d.key == METOO.key;          
      });
     d.date = parseDate(d.key);
     d.value1 = d.value;
     d.value2 = (result[0] !== undefined) ? result[0].value : null;
    });
    return retweetsByDate;   
  }


  getRepliesByDate(){
    var repliesByDate = d3.nest()
      .key(function(d) { return d.date; })
      .rollup(function(v) { return d3.sum(v, function(d) { return d.replies; }); })
      .entries(this.data1);


    var repliesByDate_METOO = d3.nest()
      .key(function(d) { return d.date; })
      .rollup(function(v) { return d3.sum(v, function(d) { return d.replies; }); })
      .entries(this.data2);    

    repliesByDate.forEach(function(d) {
          var result = repliesByDate_METOO.filter(function(METOO){
          return d.key == METOO.key;
      });
     d.date = parseDate(d.key);
     d.value1 = d.value;
     d.value2 = (result[0] !== undefined) ? result[0].value : null;
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
      .entries(this.data1);

    var averageratioByDate_METOO = d3.nest()
      .key(function(d) { return d.date; })
      .rollup(function(v) { return d3.mean(v, function(d) 
          { if ( (d.likes+d.retweets) == 0 ) return 0;
            else return d.replies/(d.likes+d.retweets); 
          }); 

                          })
      .entries(this.data2);

    averageratioByDate.forEach(function(d) {
          var result = averageratioByDate_METOO.filter(function(METOO){
          return d.key == METOO.key;
      });
     d.date = parseDate(d.key);
     d.value1 = d.value;
     d.value2 = (result[0] !== undefined) ? result[0].value : null;
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
      .entries(this.data1);

    var aggregateratioByDate_METOO = d3.nest()
      .key(function(d) { return d.date; })
      .rollup(function(v) 
            { 
              return d3.sum(v, function(d) { return d.replies})/
                (d3.sum(v, function(d) { return d.likes})
                +d3.sum(v, function(d) { return d.retweets})); 
            })
      .entries(this.data2);

    aggregateratioByDate.forEach(function(d) {
          var result = aggregateratioByDate_METOO.filter(function(METOO){
          return d.key == METOO.key;
      });
     d.date = parseDate(d.key);
     d.value1 = d.value;
     d.value2 = (result[0] !== undefined) ? result[0].value : null;
    }); 
    return aggregateratioByDate;    
  }

  getTotalByDate(){
    var totalByDate = d3.nest()
      .key(function(d) { return d.date; })
      .rollup(function(v) { return d3.sum(v, function(d) { return d.replies + d.retweets + d.likes; }); })
      .entries(this.data1);


    var totalByDate_METOO = d3.nest()
      .key(function(d) { return d.date; })
      .rollup(function(v) { return d3.sum(v, function(d) { return d.replies + d.retweets + d.likes; }); })
      .entries(this.data2);


    totalByDate.forEach(function(d) {
          var result = totalByDate_METOO.filter(function(METOO){
          return d.key == METOO.key;
      });
     d.date = parseDate(d.key);
     d.value1 = d.value;
     d.value2 = (result[0] !== undefined) ? result[0].value : null;
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

