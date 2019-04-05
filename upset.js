    function findIntersection(set1, set2) {
      //see which set is shorter
      var temp;
      if (set2.length > set1.length) {
          temp = set2, set2 = set1, set1 = temp;
      }

      return set1
        .filter(function(e) { //puts in the intersecting names
          return set2.indexOf(e) > -1;
        })
        .filter(function(e,i,c) { // gets rid of duplicates
          return c.indexOf(e) === i;
        })
    }

    //for the difference of arrays - particularly in the intersections and middles
    //does not mutate any of the arrays
    Array.prototype.diff = function(a) {
        return this.filter(function(i) {return a.indexOf(i) < 0;});
    };

    //for calculating solo datasets
    function subtractUpset(i, inds, names) {
      var result = names[i].slice(0)
      for (var ind = 0; ind < inds.length; ind++) {
        // set1 vs set2 -> names[i] vs names[ind]
        for (var j = 0; j < names[inds[ind]].length; j++) { // for each element in set2
          if (result.includes(names[inds[ind]][j])) { 
            // if result has the element, remove the element
            // else, ignore
            var index = result.indexOf(names[inds[ind]][j])
            if (index > -1) {
              result.splice(index, 1)
            }
          }
        }
      }
      return result
    }

    //recursively gets the intersection for each dataset
    function helperUpset(start, end, numSets, names, data) {
      if (end == numSets) {
        return data
      }
      else {
        var intSet = {
          "set": data[data.length-1].set + end.toString(),
          "names": findIntersection(data[data.length-1].names, names[end])
        }
        data.push(intSet)
        return helperUpset(start, end+1, numSets, names, data)
      }
    }

    function makeUpset(sets, names) { // names: [[],[]]
      //number of circles to make
      var numCircles = sets.length
      var numSets = sets.length

      //position and dimensions
      var margin = {
        top: 80,
        right: 100,
        bottom: 100,
        left: 100
      };
      var width = 600;
      var height=500;
      

      // make the canvas
      var svg = d3.select("#venn") 
          .append("svg")
              .attr("width", width + margin.left + margin.right)
              .attr("height", height + margin.top + margin.bottom)
          .attr("xmlns", "http://www.w3.org/2000/svg")
          .attr("xmlns:xlink", "http://www.w3.org/1999/xlink")
          .append("g")
              .attr("transform",
                    "translate(" + margin.left + "," + margin.top + ")")
          .attr("fill", "white");

      // graph title
      var graphTitle = svg.append("text")
        .attr("text-anchor", "middle")
        .attr("fill","black")
        .style("font-size", "20px")
        .attr("transform", "translate("+ (width/2) +","+ -20 +")")
        .text("An UpSet plot");

         // make a group for the upset circle intersection things
      var upsetCircles = svg.append("g")
      .attr("id", "upsetCircles")
      .attr("transform", "translate(20," + (height-60) + ")")
      
      
      var rad = 13,
      height = 400;

      // computes intersections
      var data2 = []
        
      for (var i = 0; i < numSets; i++) {
        var intSet = {
          "set": i.toString(),
          "names": names[i]
        }
        data2.push(intSet)

        for (var j = i + 1; j < numSets; j++) {
          var intSet2 = {
            "set": i.toString() + j.toString(),
            "names": findIntersection(names[i], names[j])
          }
          data2.push(intSet2)
          helperUpset(i, j+1, numSets, names, data2)
        }
      }

      //removing all solo datasets and replacing with data just in those datasets (cannot intersect with others)
      var tempData = []
      for (var i = 0; i < data2.length; i++) {
        if (data2[i].set.length != 1) { // solo dataset
          tempData.push(data2[i])
        }
      }
      data2 = tempData

      for (var i = 0; i < numSets; i++) {
        var inds = Array.apply(null, {length: numSets}).map(Function.call, Number)
        var index = inds.indexOf(i)
        if (index > -1) {
          inds.splice(index, 1);
        }
        var result = subtractUpset(i, inds, names)
        data2.push({
          "set": i.toString(),
          "names": result
        })
      }

      // makes sure data is unique
      var unique = []
      var newData = []
      for (var i = 0; i < data2.length; i++) {
        if (unique.indexOf(data2[i].set) == -1) {
          unique.push(data2[i].set)
          newData.push(data2[i])
        }
      }

      var data = newData


      // making dataset labels
      for (var i = 0; i < numSets; i++) {

        upsetCircles.append("text")
          .attr("dx", -20)
          .attr("dy", 5 + i * (rad*2.7))
          .attr("text-anchor", "end")
          .attr("fill", "black")
          .style("font-size", 13)
          .text(sets[i])
      }

      // sort data decreasing
      data.sort(function(a, b) {
        return parseFloat(b.names.length) - parseFloat(a.names.length);
      });

      // make the bars
      var upsetBars = svg.append("g")
        .attr("id", "upsetBars")
        
        
        var nums = []
        for (var i = 0; i < data.length; i++) {
          nums.push(data[i].names.length)
        }

        var names = []
        for (var i = 0; i < data.length; i++) {
          names.push(data[i].names)
        }

      //set range for data by domain, and scale by range
      var xrange = d3.scaleLinear()
        .domain([0, nums.length])
        .range([0, width]);


      var yrange = d3.scaleLinear()
        .domain([0, nums[0]])
        .range([height, 0]);


      //set axes for graph
      var xAxis = d3.axisBottom(xrange)
        .tickPadding(2)
        .tickFormat(function(d,i) { return data[i].set})
        .tickValues(d3.range(data.length));

      var yAxis = d3.axisLeft(yrange)
        .tickSize(5)

      //add X axis
      upsetBars.append("g")
          .attr("class", "x axis")
          .attr("transform", "translate(0," +  height + ")")
          .attr("fill", "none")
          .attr("stroke", "black")
          .attr("stroke-width", 1)
          .call(xAxis)
          .selectAll(".tick")
          .remove()


      // Add the Y Axis
      upsetBars.append("g")
          .attr("class", "y axis")
          .attr("fill", "none")
          .attr("stroke", "black")
          .attr("stroke-width", 1)
          .call(yAxis)
          .selectAll("text")
          .attr("fill", "black")
          .attr("stroke", "none");

        

      var chart = upsetBars.append('g')
              .attr("transform", "translate(1,0)")
              .attr('id','chart');

      // adding each bar
      chart.selectAll('.bar')
              .data(data)
              .enter()
              .append('rect')
              .attr("class", "bar")
              .attr('width', 15)
              //.attr("x", function(d){ 1 + d.names.length; })
              .attr("x", function(d,i){ return (rad-1) + i * (rad*2.7); })
              .attr("y", function(d){ return yrange(d.names.length); })             
              .style('fill', "darkslategrey")
              .attr('height',function(d){ return height - yrange(d.names.length); });

      //circles
      for (var i = 0; i < data.length; i++) {
        for (var j = 0; j < numSets; j++) {
          upsetCircles.append("circle")
            .attr("cx", i * (rad*2.7))
            .attr("cy", j * (rad*2.7))
            .attr("r", rad)
            .attr("id", "set" + i)
            .style("opacity", 1)
            .attr("fill", function() {
              if (data[i].set.indexOf(j.toString()) != -1) {
                return "darkslategrey"
              } else {
                return "silver"
              }
            })
          
        }

        if (data[i].set.length != 1) {
          upsetCircles.append("line")
            .attr("id",  "setline" + i)
            .attr("x1", i * (rad*2.7))
            .attr("y1", data[i].set.substring(0, 1) * (rad*2.7))
            .attr("x2", i * (rad*2.7))
            .attr("y2", data[i].set.substring(data[i].set.length - 1, data[i].set.length) * (rad*2.7))
            .style("stroke", "darkslategrey")
            .attr("stroke-width", 4)
          
        }
      }
    }

    // var sets = ['maga', 'trump', 'boycottkeurig', 'americafirst', 'trumptrain']

    // var names = [['929859559044341760', '929852001600581632', '929860910365233152', '929843095407079425', '929852516614864896', '929854105874583552', '929848745692237824', '929857155880144896', '929852951186698241', '929853989709078528', '929839390339354624', '929858650000281600', '929838745737670657', '929858398463647745', '929838271189757952', '929844501614432263', '929853539714850816', '929848825354874881', '929839318314766336', '929844551799443458', '929856718493724672', '929859119636516864', '929835711624372224', '929860952924807168', '929860249485565954', '929859408607158272', '929858651422121984', '929857883323367425', '929857395412660225', '929857091560529921', '929854641092866051', '929854516878553092', '929851484610719744', '929850642138529793', '929849516702003205', '929849370685648898', '929848254136688641', '929845568502984704', '929844707827609601', '929844598264000515', '929860006949695488', '929858081680437248', '929856795807551488', '929855627584786436', '929854997923336192', '929854598692724736', '929853589962592258', '929847519084982273', '929846864324653056', '929845252701134848', '929844092531507200', '929843488497324034', '929843413020688384', '929843250344660993', '929843233680707585', '929840769694912513', '929839050407559168', '929838621477269510', '929836937854308352', '929835528148660224', '929834476808687616', '929832208415653889', '929831280006647810', '929830413807378434', '929830011078631425', '929829600775065600', '929823545177362434', '929822380549136384', '929822222079762432', '929821766268145666', '929821538945089536', '929821229430734849', '929820241357615110', '929819695091474434', '929819220489244673', '929819195088322560', '929816148530561029', '929814939354783750', '929811537317060609', '929810895299141638', '929808889872244736', '929807263497375744', '929806261436190720', '929805651185995782', '929802601457246209', '929802371705769985', '929802183264145408', '929802128930963456', '929799223377215488', '929799121413836801', '929798176596418560', '929795702657634306', '929795308845875200', '929794942083334144', '929789872986083328', '929787572636729344', '929785674093363200', '929785279795179520', '929785015914950656', '929784100440985600', '929783362255851520', '929783176586674176', '929781891577843712', '929781326944890880', '929780726651858950', '929780377366953990', '929780199905935361', '929777361406517249', '929777106011041792', '929776022190481408', '929774559729012736', '929772897287143424', '929771051126534145', '929767815242027008', '929767008211800065', '929765915658506241', '929762679111258112', '929761817534107648', '929760759457783808', '929759228721496066', '929759031178285056', '929757474088816640', '929757413615570945', '929756529477251072', '929755877309108224', '929755728470036480', '929755714515451904', '929755066453647360', '929753839099699201', '929753697281826816', '929752602639712256', '929752309109870593', '929751712037867520', '929750871902171136', '929750102532427776', '929749089939542016', '929749050072731651', '929748596760518656', '929745000153444354', '929744641481637889', '929743907130347520', '929743746551439360', '929743457807224835', '929742951500132352', '929741294276096000', '929740995582767104', '929740981511081984', '929740718989508609', '929739711077330946', '929739541253988353', '929739398006132736', '929739020631932930', '929738861575536641', '929737655859871745', '929733379033124864', '929733231863390208', '929729767024324609', '929728424817635328', '929727908914040833', '929726714296524801', '929726158370951168', '929725688139210752', '929724869759160322', '929724831670718464', '929724225027493890', '929724098623754240', '929723611107266561', '929723257896554496', '929722345241042945', '929718781798178816', '929717734438469632', '929717210230206465', '929716030578024448', '929714407361392640', '929713744850153473', '929712578925924354', '929709983574478850', '929706455078506496', '929705861798420481', '929704933238214658', '929703985828818944', '929703689484423170', '929702158068482048', '929701663606296576', '929700756525125632', '929699956168019976', '929699866900598785', '929699762898534400', '929695385819467776', '929692573698002944', '929689340862705664', '929688480862625794', '929688065651761152', '929682416708608000', '929682050185093120', '929680924702380037', '929660815086637056', '929659498817638400', '929655535179243526', '929654819895349248', '929653043221749760', '929649415484186624', '929648616687497221', '929633903555440640', '929630659324157954', '929626816741916672', '929620618592403456', '929614822697832448', '929614289270386688', '929607801336348672', '929606936634511360', '929600462965403648', '929599937381269504', '929585406487666689', '929582716328198144', '929579570092806145', '929577643866972162', '929573790098624512', '929572964965654528', '929571782545227776', '929569276700356608', '929568007629582336', '929564729642766337', '929563470084886530', '929562339153760256', '929562118495592448', '929561506542481408', '929559934664134656', '929559528588369920', '929559201747107841', '929558870955118592', '929558535523971075', '929557118755237890', '929556315151654912', '929555239220531200', '929554628756365312', '929549100822888448', '929549020539817986', '929548242856976385', '929547800106491904', '929547329912344576', '929546428728381441', '929545834592600064', '929545799767379968', '929545186958565376', '929543555625783297', '929539125186826240', '929539109365993474', '929538481986179073', '929538200867090432', '929538195448090630', '929537922264596480', '929536728909656064', '929532491614117888', '929532073026752517', '929529404035928064', '929529064033079296', '929528442273632257', '929528104787349504', '929527576019611648', '929526553175719937', '929525186860285952', '929525163594473472', '929524534289616896', '929522841674018816', '929520124192788480', '929518913653755904', '929518465198837760', '929517898086993920', '929517784547119106', '929516255043731456', '929516095710679040', '929512714933809153', '929512689113686016', '929512524336132096', '929511678831497216', '929511244272254976', '929511168711868416', '929510607346380800', '929510331516366850', '929510115698290688', '929509701464838150', '929509561802919936', '929508154680864768', '929507248396627968', '929506173274939392', '929505327313285121', '929505101374423040', '929504921820557314', '929504547034353664', '929503913291608065', '929503804218888192', '929499735303643138', '929499702638211072', '929499636028592128', '929499591103434753', '929499545318203392', '929499428859265026', '929499340120276992', '929499300073295872', '929499247560577026', '929499228526673921', '929499188127076352', '929499167495516160', '929499130371739649', '929499122276675590', '929499078844669952', '929499076625862656', '929499076055486464', '929499075971514369', '929498993834459138'], ['929852001600581632', '929839390339354624', '929838745737670657', '929835711624372224', '929844707827609601', '929822222079762432', '929805651185995782', '929781891577843712', '929767008211800065', '929755728470036480', '929745000153444354', '929733379033124864', '929728424817635328', '929726158370951168', '929725688139210752', '929717734438469632', '929714407361392640', '929705861798420481', '929701663606296576', '929585406487666689', '929549020539817986', '929547329912344576', '929545799767379968', '929528104787349504', '929522841674018816', '929505101374423040', '929498993834459138'], ['929838621477269510', '929816148530561029', '929805651185995782', '929799223377215488', '929799121413836801', '929795702657634306', '929785015914950656', '929781891577843712', '929777361406517249', '929777106011041792', '929761817534107648', '929757413615570945', '929742951500132352', '929741294276096000', '929739711077330946', '929739398006132736', '929723257896554496', '929718781798178816', '929713744850153473', '929682416708608000', '929606936634511360', '929600462965403648', '929562339153760256', '929558870955118592'], ['929860910365233152', '929843095407079425', '929830011078631425', '929820241357615110', '929807263497375744', '929784100440985600', '929780199905935361', '929759228721496066', '929716030578024448', '929606936634511360', '929562118495592448', '929554628756365312', '929545186958565376', '929539109365993474', '929538481986179073', '929527576019611648', '929522841674018816', '929517898086993920', '929505101374423040', '929499702638211072', '929499247560577026'], ['929859559044341760', '929860910365233152', '929843095407079425', '929855627584786436', '929795702657634306', '929776022190481408', '929729767024324609', '929727908914040833', '929725688139210752', '929717734438469632', '929695385819467776', '929633903555440640', '929563470084886530', '929554628756365312', '929547800106491904', '929545834592600064', '929545186958565376', '929538200867090432', '929499122276675590']]

    // makeUpset(sets,names);
    // change date to date range later
    filename = 'data/clean_maga_011518_041418.json'
    date = '2018-04-04'
    // function loadData(filename,date) {
    d3.json(filename,(d) => {
        dat = d;
            // filter by date first then
        var fltrdData = dat.filter((d) => d.date==date);
        var allHts = [];
        var htCounter = {};
        fltrdData.forEach((item) => {
            allHts = allHts.concat(item.hashtags);
        });
        allHts.forEach((ht) => {
            if (!(ht in htCounter)) {
                htCounter[ht] = 1
            } else {
                htCounter[ht] += 1
            }
        });
        // sets = [array of 5 most common hashtags]
        var setsAll = Object.keys(htCounter).sort(function(a,b) {
            return htCounter[b]-htCounter[a]
        });
        var sets = setsAll.slice(0,5);
        // names = [for ht in sets, array of all tweet ids with ht in ht]
        var names = [];
        sets.forEach ((ht) => {
            idList = [];
            fltrdData.forEach((item) => {
                if (item.hashtags.includes(ht)) {
                    idList.push(item.id)
                }
            });
            names.push(idList);
        });
        makeUpset(sets,names);
    });
    // };
        // makeUpset(sets,names);
        // return sets
