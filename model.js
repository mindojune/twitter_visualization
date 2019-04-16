'use strict';

var parseDate = d3.timeParse("%Y-%m-%d");

class Model {
  constructor(dataSource_MAGA, dataSource_METOO) {
    this.dataSource_MAGA = dataSource_MAGA;
    this.dataSource_METOO = dataSource_METOO;
    this.data1 = [];
    this.data2 = [];

    this.aligned = false;
  }

  loadData() {
    this.data1 = [];
    this.data2 = [];

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

  // sortByReplies(date){
  //   var tweetsByDate = d3.nest()
  //     .key(function(d) { return d.date; })
  //     .entries(this.data1);

  //   var tweetsBy_date = tweetsByDate.filter(function(METOO){
  //         //console.log(METOO.key);
  //         return METOO.key == date;
  //   });
  //   tweetsBy_date = tweetsBy_date[0].values;

  //   var sorted_by_replies = tweetsBy_date.sort(function(x, y){
  //       return d3.descending(x.replies, y.replies);
  //   });
  //   return sorted_by_replies;
  // }

  getDateTweet(date, dataset){
    //console.log(dataset);
    var tweetsByDate = d3.nest()
      .key(function(d) { return d.date; })
      .entries(dataset);

    var tweetsByDate = tweetsByDate.filter(function(METOO){
          return METOO.key == date;
    });


    return tweetsByDate;
  }

  sortByLikes(date){
    var MAGAtweets = this.getDateTweet(date,this.data1)[0].values;
    var METOOtweets = this.getDateTweet(date,this.data2)[0].values;

    var MAGAsorted  = MAGAtweets.sort(function(x, y){
        return d3.descending(x.likes, y.likes);
    });
    var METOOsorted = METOOtweets.sort(function(x, y){
        return d3.descending(x.likes, y.likes);
    });

    //console.log(MAGAsorted, METOOsorted);
    return [MAGAsorted, METOOsorted];
  }

  sortByReplies(date){
    var MAGAtweets = this.getDateTweet(date,this.data1)[0].values;
    var METOOtweets = this.getDateTweet(date,this.data2)[0].values;

    var MAGAsorted  = MAGAtweets.sort(function(x, y){
        return d3.descending(x.replies, y.replies);
    });
    var METOOsorted = METOOtweets.sort(function(x, y){
        return d3.descending(x.replies, y.replies);
    });

    //console.log(MAGAsorted, METOOsorted);
    return [MAGAsorted, METOOsorted];
  }


  sortByRetweets(date){
    var MAGAtweets = this.getDateTweet(date,this.data1)[0].values;
    var METOOtweets = this.getDateTweet(date,this.data2)[0].values;

    var MAGAsorted  = MAGAtweets.sort(function(x, y){
        return d3.descending(x.retweets, y.retweets);
    });
    var METOOsorted = METOOtweets.sort(function(x, y){
        return d3.descending(x.retweets, y.retweets);
    });

    //console.log(MAGAsorted, METOOsorted);
    return [MAGAsorted, METOOsorted];
  }

  sortByTotal(date){
    var MAGAtweets = this.getDateTweet(date,this.data1)[0].values;
    var METOOtweets = this.getDateTweet(date,this.data2)[0].values;

    var MAGAsorted  = MAGAtweets.sort(function(x, y){
        return d3.descending(x.replies+x.retweets+x.likes, y.replies+y.retweets+y.likes);
    });
    var METOOsorted = METOOtweets.sort(function(x, y){
        return d3.descending(x.replies+x.retweets+x.likes, y.replies+y.retweets+y.likes);
    });

    //console.log(MAGAsorted, METOOsorted);
    return [MAGAsorted, METOOsorted];
  }

  sortByRatio(date){
    var MAGAtweets = this.getDateTweet(date,this.data1)[0].values;
    var METOOtweets = this.getDateTweet(date,this.data2)[0].values;

    var MAGAsorted  = MAGAtweets.sort(function(x, y){
        return d3.descending(x.replies/(x.likes+x.retweets), y.replies/(y.likes+y.retweets));
    });
    var METOOsorted = METOOtweets.sort(function(x, y){
        return d3.descending(x.replies/(x.likes+x.retweets), y.replies/(y.likes+y.retweets));
    });

    //console.log(MAGAsorted, METOOsorted);
    return [MAGAsorted, METOOsorted];
  }

  // TODO: Rightnow METOO date is clipped to MAGA's?

  getTweetsByDate(){
    var tweetsByDate = d3.nest()
      .key(function(d) { return d.date; })
      .entries(this.data1);

    var tweetsByDate_METOO = d3.nest()
      .key(function(d) { return d.date; })
      .entries(this.data2);  

    var $this = this;
    tweetsByDate.forEach(function(d) {
      var result = tweetsByDate_METOO.filter(function(METOO){
          return d.key == METOO.key;
      });
       if($this.aligned){
        d.date = (d.key);
       }
       else{
        d.date = parseDate(d.key);
       }
       
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

    var $this = this;
    likesByDate.forEach(function(d) {
          var result = likesByDate_METOO.filter(function(METOO){
          return d.key == METOO.key;
      });
       if($this.aligned){
        d.date = (d.key);
       }
       else{
        d.date = parseDate(d.key);
       }
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

    var $this = this;
    retweetsByDate.forEach(function(d) {
          var result = retweetsByDate_METOO.filter(function(METOO){
          return d.key == METOO.key;          
      });
       if($this.aligned){
        d.date = (d.key);
       }
       else{
        d.date = parseDate(d.key);
       }
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

    var $this = this;
    repliesByDate.forEach(function(d) {
          var result = repliesByDate_METOO.filter(function(METOO){
          return d.key == METOO.key;
      });
       if($this.aligned){
        d.date = (d.key);
       }
       else{
        d.date = parseDate(d.key);
       }
     d.value1 = d.value;
     d.value2 = (result[0] !== undefined) ? result[0].value : null;
    });

    //console.log(repliesByDate);
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

    var $this = this;
    averageratioByDate.forEach(function(d) {
          var result = averageratioByDate_METOO.filter(function(METOO){
          return d.key == METOO.key;
      });
       if($this.aligned){
        d.date = (d.key);
       }
       else{
        d.date = parseDate(d.key);
       }
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

    var $this = this;
    aggregateratioByDate.forEach(function(d) {
          var result = aggregateratioByDate_METOO.filter(function(METOO){
          return d.key == METOO.key;
      });
       if($this.aligned){
        d.date = (d.key);
       }
       else{
        d.date = parseDate(d.key);
       }
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

    var $this = this;
    totalByDate.forEach(function(d) {
          var result = totalByDate_METOO.filter(function(METOO){
          return d.key == METOO.key;
      });
       if($this.aligned){
        d.date = (d.key);
       }
       else{
        d.date = parseDate(d.key);
       }
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

