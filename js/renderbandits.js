
//The purpose of this stuff is to graph/output various things about a bandit run
//Influenced by campd.com's nice stuff on the Bandit problem
//  at http://camdp.com/blogs/multi-armed-bandits
//uses jQuery for the moment... need to break free of that soon in general

// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
// EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
// OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
// NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
// HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
// WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
// FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
// OTHER DEALINGS IN THE SOFTWARE.


window.RenderBandits = function(opts) {
  
  var that = this;
  var caller = opts.caller;
  var mainDiv = opts.MainDivID;
  var mainDiv$ = $(opts.MainDivID);
  
  that.defaultHeight = 75;
  that.defaultWidth = 350;
  
  var x_array = [];
  var _N = 100;
  var max_data = 10
  // for ( var i =0; i < _N; i++ ){
      // x_array.push( .01*i )
  // }
  x_array.push(0.0001);
  for ( var i =1; i < _N-1 ; i++ ){
      x_array.push( .01*i )
  }
  x_array.push(1-0.0001);
  
  that.isInitialized = false;
  that.lastBandits = null;
  
  that.update = function(theOpts) {
    
    var ln_epsilon = Math.log(1e-10);

    if (!that.isInitialized) {
      that.initialize(theOpts);
      that.isInitialized = true;
    };
    //update whatever
    that.LastBandits = that.theBandits;
    
    that.theBandits = theOpts.theBandits; 
    if (!that.LastBandits) {
      that.LastBandits = that.Bandits;
    }
    
    that.randomNumbersForPull = theOpts.randomNumbersForPull;
    
    
    that.theBandits.forEach(function(b, index) {
  
        var percent = " (" +  (  (b.stats.numberSuccesses/b.stats.numberPulls)*100).toFixed(0) + "%"  + ")";
        if (b.stats.numberPulls===0) {
         percent=""; 
        }
        
        var lastB = that.LastBandits[index];
        var thisMisses = b.stats.numberPulls - b.stats.numberSuccesses;
        var lastMisses = lastB.stats.numberPulls - lastB.stats.numberSuccesses;
        
        $("#" + "pulls_" + index).html(b.stats.numberPulls);
        $("#" + "successes_" + index).html(b.stats.numberSuccesses + percent);
        
        if (lastB.stats.numberSuccesses < b.stats.numberSuccesses) {
          //$("#" + "successes_" + index).css("background-color","#52D017");
          setBackgroundColorAndFadeToWhite($("#" + "successes_" + index),"#52D017", 800);
        }
        else {
          //$("#" + "successes_" + index).css("background-color","white");
        }
        if (lastMisses < thisMisses) {
          //$("#" + "misses_" + index).css("background-color","red");
          setBackgroundColorAndFadeToWhite($("#" + "misses_" + index),"#FF2400", 800);
          //setBackgroundColorAndFadeToWhite($("#" + "successes_" + index),"green", 100);
        }
        else {
          //$("#" + "misses_" + index).css("background-color","white");
        }
        
        $("#" + "misses_" + index).html(b.stats.numberPulls - b.stats.numberSuccesses);

       var alpha = b.currentDistributionParameters.alpha;
       var beta = b.currentDistributionParameters.beta;

       var theMax = -1;
       var _data = x_array.map(function(x) {
                //console.log(x + ", " + jStat.beta.pdf(x,alpha,beta));
                
                // (Math.pow(x, alpha - 1) * Math.pow(1 - x, beta - 1)) / jStat.betafn(alpha, beta);
                //calculate ln of beta pdf
                var ln_y =  ((alpha-1)*Math.log(x) + (beta-1)*Math.log(1-x))  - (jStat.betaln(alpha,beta));
                
                //var y = jStat.beta.pdf(x,alpha,beta);
                //avoid underflow, which seems to be the first issue hit when alpha and/or beta are large...
                if (ln_y < ln_epsilon) {
                 y = 0; 
                }
                else {
                 y = Math.exp(ln_y); 
                }
                
                //if (isNaN(ln_y)) {
                // console.log(x + " is NAN"); 
                //}
                //console.log(ln_y + ", " + Math.abs(ln_y - Math.log(y)));
                //var yy = jStat.beta.pdf(x,alpha,beta);
                //console.log(Math.abs(ln_y - Math.log(yy)));
                
                
                theMax = Math.max(y,theMax);
                return y;
       }); 

       

        var g = d3.select("#theGraph_" + index);
        //console.log(g);
        var margin = 15;
        var w=that.defaultWidth; //400;
        var h=that.defaultHeight; //100;
        y = d3.scale.linear().domain([0, theMax]).range([h - margin,0 + margin ]),
        x = d3.scale.linear().domain([0,_N]).range([0 + margin, w - margin]);
        
        var line = d3.svg.line()
            .x(function(d, i) { return x(i); })
            .y(y)        

        g.select("#line-" + index)
             .data( [_data] )
             .attr("d", line );            


        g.select('#actualProb_' + index)
          .attr("x1", margin + (w-2*margin)*b.CurrentActualProbability)
          .attr("x2", margin + (w-2*margin)*b.CurrentActualProbability);

            
    });  
    
    
    
    // var margin = {top: 10, right: 30, bottom: 30, left: 30},
    // width = that.defaultWidth;// - margin.left - margin.right,
    // height = that.defaultHeight;// - margin.top - margin.bottom;
//     
    // var x = d3.scale.linear()
        // .domain([0, 1])
        // .range([0, width]);
//     
//     
    // //console.log(theOpts.stats.theSamplesForThisPull.length + ", " + theOpts.stats.theSamplesForThisPull[theOpts.stats.theSamplesForThisPull.length-1]);
    // console.log(that.randomNumbersForPull);
    // // Generate a histogram using twenty uniformly-spaced bins.
    // var data = d3.layout.histogram()
        // .bins(x.ticks(100))
        // (that.randomNumbersForPull);
//     
    // //console.log(theOpts.stats.theSamplesForThisPull);
    // console.log(data);
//     
    // //figure out why this is not working...
//     
    // var y = d3.scale.linear()
        // .domain([0, d3.max(data, function(d) { return d.y; })])
        // .range([height, 0]);
//     
    // // var xAxis = d3.svg.axis()
        // // .scale(x)
        // // .orient("bottom");
//     
    // // var svg = d3.select("body").append("svg")
        // // .attr("width", width + margin.left + margin.right)
        // // .attr("height", height + margin.top + margin.bottom)
      // // .append("g")
        // // .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
//     
    // var bar =  that.visSamples.selectAll(".bar")
        // .data(data)
        // .enter().append("g")
          // .attr("class", "bar")
          // .attr("transform", function(d) { return "translate(" + x(d.x) + "," + y(d.y) + ")"; });
          // //.attr("transform", function(d) { return "translate(" + x(d.x) + "," + "0" + ")"; });
//     
    // bar.append("rect")
        // .attr("x", 1)
        // .attr("width", x(data[0].dx) - 1)
        // .attr("height", function(d) { return height - y(d.y); });
    
    
    
      
  };
  
  var setBackgroundColorAndFadeToWhite = function(el$, sColor, duration_ms)  {
    el$.stop();
    el$.css("background-color",sColor);
    el$.animate({backgroundColor:"#FFFFFF"},duration_ms);    
  };
  
  
  that.initialize = function(moreOpts) {

      that.theBandits = moreOpts.theBandits; //array of basic Bandit objects; no functions since this will
                                        //will be being passed back from the web worker
      mainDiv$.html("");  
        
      //make a table
      var sTable = "<table style='margin-right:auto;margin-left:auto;' id='outputGraphs'>";
      
      var sTitleActual = "This is the actual probability of success for each bandit (which the algorithm does not know).  You can change it by entering a new value or dragging your mouse left or right in the input box.";
      var sTitle="This is the current estimated distribution for the probability of success.  It is a beta distribution with parameters alpha=1+#successes, beta=1+#misses.  Each time the bandit is tried, this distribution will get updated based on whether there was a success or not.";

      sTable += "<tr>" + "<th>Bandit</th><th title='" + sTitleActual + "'>Actual Probability</br><span class='subInfo'>Enter new value or</br>drag mouse in input box to change</span></th>" +
                "<th title='" + sTitle + "'>Posterior Distribution </br><span class='subInfo'>Black bar is the bandit's actual probability of success</span></th>" +
                "<th>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Hits&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</th><th>&nbsp;&nbsp;&nbsp;Misses&nbsp;&nbsp;&nbsp;</th><th>Total Pulls</th></tr>";
      
      that.theVis = []; //svg vis for each one
      
      var rawIndex=0;
      that.theBandits.forEach(function(b, index) {
        
        rawIndex++;
        var sRow = "<tr>";
        
        sRow += "<td>" + (index+1) + "</td>";
        var sInput ="<td>" + 
                    "<input " +
                    " size='4' min='0' max='1'" +
                    " diff='0.01' " +
                    " banditIndex='" + index + "' " +
                    " id = 'raw_" + rawIndex + "' " +
                    " rawIndex ='" + rawIndex + "' " + 
                    " class='inputNumber decimal runningProbability' type='text' " +
                    " value='" + b.stats.probabilityHistory[b.stats.probabilityHistory.length-1].probability.toFixed(2) + "'/>" + 
                    "</td>";

        sRow += sInput;   
        
        //now the graph
        var theId = "graph_" + index;
        var sGraph = "<td class='aGraph'>" + "<div id='" + theId + "' ></div></td>";
        
        sRow += sGraph;           

        var sSuccesses = "<td><div class = 'outputData' id='successes_" + index + "'>" + b.stats.numberSuccesses + "</td>";
        sRow += sSuccesses;

        var sMisses = "<td><div  class = 'outputData'  id='misses_" + index + "'>" + (b.stats.numberPulls - b.stats.numberSuccesses) + "</td>";
        sRow += sMisses;

        var sPulls = "<td><div  class = 'outputData'  id='pulls_" + index + "'>" + b.stats.numberPulls + "</td>";
        sRow += sPulls;

             
        sRow += "</tr>";
        
        sTable += sRow;
        
      });
      
      sTable += "</table>";
  
     var theIdSamples = "graph_samples";
     var sGraph = "<div id='sampleGraph'></div>";
      sTable += sGraph;
      
      mainDiv$.html(sTable);
      $(".decimal").ForceNumericOnly();

      //console.log(sTable);
    
     var unselectIt = function() {
          d3.selectAll(".actualProbabilityLine").classed("lineActive",false); 
          that.currentLineSelected = null;
      }

      //this fires too much  $('body').on("mouseout", '.aGraph',function(event) {
        // console.log("mouseout on thing");
        // unselectIt();
      // });
      
        
    //loop through again, now that the stuff is in there
      that.theBandits.forEach(function(b, index) {
        
        
        var theId = "graph_" + index;

        //var w=400;
        //var h=100;
        var w=that.defaultWidth; //400;
        var h=that.defaultHeight; //100;
        var margin = 15; //15;
        
        var vis = d3.select("#" + theId)
                      .append("svg:svg")
                      .attr("width", w )
                      .attr("height", h )
                      .on("ignoremouseout",unselectIt)
                      .on("mouseup",unselectIt)
                      .on("mousemove",function() {
                        
                        if (that.currentLineSelected) {
                           //console.log(d3.mouse(this)); 
                           
                           //.attr("x1", margin + (w-2*margin)*b.CurrentActualProbability)
                           //map mouse x to place on axis
                           var theX = d3.mouse(this)[0];
                           
                           var val; // = (theX-margin)/that.defaultWidth;
                           if (theX <= margin) {
                             val = 0;
                           }
                           else if (theX > that.defaultWidth - margin) {
                             val = 1; 
                           }
                           else {
                             val = (theX - margin)/(that.defaultWidth - 2*margin);
                           }
                           
                           val = val.toFixed(2);
                           //map val back to X
                           theX = margin + val*(that.defaultWidth - 2*margin);
                           var banditIndex = that.currentLineSelected.attr("banditIndex");
                           //tell things that we need to change this...
                           caller.updateBanditActualProbability(banditIndex,val);
                           
                           that.currentLineSelected.attr("x1",theX);
                           that.currentLineSelected.attr("x2",theX);
                        }
                        
                      });
        
        
        var g = vis.append("svg:g").attr("id","theGraph_" + index);
    
        var alpha = b.currentDistributionParameters.alpha;
        var beta = b.currentDistributionParameters.beta;


       var theMax = -1;
       var _data = x_array.map(function(x) {
                var y = jStat.beta.pdf(x,alpha,beta);
                theMax = Math.max(y,theMax);
                return y;
            //console.log(x + ", " + jStat.beta.pdf(x,alpha,beta));
//            return jStat.beta.pdf(x,alpha,beta);
        });

        y = d3.scale.linear().domain([0, max_data]).range([h - margin,0 + margin ]),
        x = d3.scale.linear().domain([0,_N]).range([0 + margin, w - margin]);

        var line = d3.svg.line()
            .x(function(d, i) { return x(i); })
            .y(y)        

        
        //console.log(_data);
        g.selectAll('path.line')
                .data( [_data] )
                .enter()
                .append("svg:path")
                .attr("stroke", "#0000FF" )
                .attr("class","area")
                .attr("d", line )
                .attr("id", "line-" + index )
                .attr("stroke-width","2px")
                .attr("titleIgnore","This is the current distribution for the probability of success (it is a beta distribution with parameters alpha=1+#successes, beta=1+#misses).  Each time the bandit is tried, this distribution will get updated based on whether there was a success or not.");



      g.append("svg:line")
          .attr("x1", x(0))
          .attr("y1",  y(0))
          .attr("x2", x(w))
          .attr("y2", y(0))
          .attr("stroke", "#000000" );
       
      g.append("svg:line")
          .attr("x1", x(0))
          .attr("y1", y(0))
          .attr("x2", x(0))
          .attr("y2", y(max_data))
          .attr("stroke", "#000000" );

      //console.log(_N*b.CurrentActualProbability);
      g.append("svg:line")
          .attr("id","actualProb_" + index)
          .attr("x1", margin + (w-2*margin)*b.CurrentActualProbability)
          .attr("y1", y(0))
          .attr("x2", margin + (w-2*margin)*b.CurrentActualProbability)
          .attr("y2", y(max_data))
          .attr("stroke", "#000000" )
          .attr("stroke-width","2px")
          .attr("banditIndex",index)
          .attr("class","actualProbabilityLine")
          .attr("titleIgnore","This is the current actual probability of success for this bandit.  If it is lower than that of the other bandits, then the bandit may be tried rarely; if it changes later to a high value, it may take a while for the bandit to be tried again so that the algorithm can start learning that it has become better.")
          .on("mouseover", function() {
              d3.select(this).classed("lineActive",true); 
           })
          .on("mousedown",function() {            
              //d3.select(this).classed("lineSelected",true);               
              that.currentLineSelected = d3.select(this);              
              //var theThing = d3.select(this);
              //console.log(d3.select(this));
            })
          .on("mouseout", function() {
              if (!that.currentLineSelected) {              
                d3.select(this).classed("lineActive",false); 
              }
           });

          // .on("mousemove",function() {            
              // //d3.select(this).classed("lineSelected",false); 
            // })
        

        // var drag = d3.behavior.drag()
          // .on("drag", function(d,i) {
              // d.x += d3.event.dx;
              // d.y += d3.event.dy;
              // var thing = d3.select(this);
              // if (thing.classed("lineSelected")) {
// 
                // console.log(thing);
//                 
                // thing.attr("transform", function(d,i){
                    // return "translate(" + [ d.x,d.y ] + ")"
                // })
              // }
        // });     

      
      g.selectAll(".xLabel")
          .data( d3.range(0,1.2,.1) )
          .enter().append("svg:text")
          .attr("class", "xLabel")
          .text(String)
          .attr("x", function(d) { return x(100*d) })
          .attr("y", h)
          .attr("text-anchor", "middle")
          .attr("dy", 0.0 )

      g.selectAll(".xTicks")
          .data(x.ticks(10))
          .enter().append("svg:line")
          .attr("class", "xTicks")
          .attr("x1", function(d) { return x(d); })
          .attr("y1", y(0))
          .attr("x2", function(d) { return x(d); })
          .attr("y2", y(-0.3))
      
      // vis.append("text")
          // .attr("x", (w / 2))             
          // .attr("y", 15 )
          // .attr("text-anchor", "middle")  
          // .style("font-size", "17px") 
          // .text("Posterior Distributions");

        that.theVis[index] = vis;

      });
    
    
      // //histogram of samples used for "pulls"
      // var w=that.defaultWidth;
      // var h=that.defaultHeight;
      // that.visSamples = d3.select("#sampleGraph")
                      // .append("svg:svg")
                      // .attr("width", w )
                      // .attr("height", h );
//      
      // // var x = d3.scale.linear()
                      // // .domain([0, 1])
                      // // .range([0, w]);                 

    
  };
  
  
  
  
};
