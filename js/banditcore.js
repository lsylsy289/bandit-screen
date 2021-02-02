
  var gg = 0;

  this.blah = 1;
  
  this.f = function(x) {
    return x+1;
  };
  
  //sadasdasdasdsa asd asdas das dasd asd asd asd 

  //self.BanditManager = 2;

  this.bBanditManager = function (theInitialProbabilities) {
    return 2;
  };
  
  if (!bBanditManager) {
   console.log("hjh"); 
  }
  else {
   //console.log("hjhass"); 
  }
    
  this.gBanditManager = function (theInitialProbabilities) {
    
    var that = this;
    that.theBandits = [];
    var numberPulls = 0;
    
    that.randomNumbersChosenForPulls = [];
    
    that.theInitialProbabilities = theInitialProbabilities; //redundant, I guess...
    that.statsForEachPull = [];
    
    theInitialProbabilities.forEach(function(p) {
       var theBandit = new Bandit(p);
       that.theBandits.push(theBandit);
    });

    that.getNumberPullsSoFar = function() {
      return that.statsForEachPull.length;
    }
    
    
    //wait - the actual bound has that C term
    //that.calculateKaufmannUpperBound    
    that.calculateKullbackLeiblerDivergence = function(p,q) {
      
      //p * ln(p/q) + (1-p)*ln[(1-p)/(1-q)]
      //p * ln(p) - p * ln(q) + (1-p)*ln(1-p) - (1-p)*ln(1-q)
      
      //deal with the weird cases of q==0, p==0
      
      if (q === 1) {
       return Number.Nan; 
      }
      else if (p===0) {
        return - Math.ln(1-q); 
      }
      else {      
        var ratio_pq = p/q;
        var ratio_oneminus = (1-p)/(1-q);      
        return p*Math.ln(ratio_pq) + (1-p)*Math.ln(ratio_oneminus);      
      }      
    };
        
    that.setActualProbabilityForBandit = function(banditIndex,val) {
      
      var bandit = that.theBandits[banditIndex];
      bandit.setActualProbability(parseFloat(val));
      
    };

    that.getBandits = function() {      
      return that.theBandits;      
    };
    
    that.getBanditsNoFunctions = function() {
       var thing = [];
       that.theBandits.forEach(function(b) {
         
         thing.push(b.getMeWithoutFunctions());
         
       });
       
       return thing;
    }
        
    that.getLatestAverageRegret = function() {
      
        if (that.statsForEachPull.length <= 0) {
          return Number.NaN;
        }
        else {
          var stats = that.statsForEachPull[that.statsForEachPull.length-1];
          return stats.regretSoFar;
        };
      
    };   
       
    //returns stats on the pull
    that.doPull = function(thingThatHasRandom) {
      
      var stats = {};      
      
      numberPulls++;
      
      stats.whichPull = numberPulls;
      
      var theSamplesForThisPull = new Array();

      //figure out which one to pull
      var max = -1;
      var indexOfMax = -1;
      var actualMax = -1;
      var indexOfActualMax = -1;
      
      that.theBandits.forEach(function(b,index) {
         var theSample = b.getSampleFromCurrentDistribution(thingThatHasRandom);
         theSamplesForThisPull[index] = theSample;
         if (theSample > max) {
           max = theSample;
           indexOfMax = index;
         }
         
         var theActualProbability = b.getCurrentActualProbability();
         if (theActualProbability> actualMax) {
           actualMax = theActualProbability;
          indexOfActualMax = index; 
         }
      });
      
      stats.theSamplesForThisPull = theSamplesForThisPull;
      stats.indexOfWhichOnePicked = indexOfMax;
      stats.max = max;


      
      stats.indexOfActualMax = indexOfActualMax;
      stats.actualMax = actualMax;


      
      var theBanditToPull = that.theBandits[indexOfMax];
      
      var regretThisTime = actualMax - theBanditToPull.getCurrentActualProbability();
      
      var sample =  thingThatHasRandom.random(); //self.mersenneTwister.random(); //= new MersenneTwister();
      //Math.random();
      that.randomNumbersChosenForPulls.push(sample);
      var wasSuccess = theBanditToPull.doPull(sample);
      
      stats.wasSuccess = wasSuccess;
      
      that.statsForEachPull.push(stats);
      
      
      stats.regretThisTime = regretThisTime;
      //update regret calculation...
      // http://en.wikipedia.org/wiki/Multi-armed_bandit
      // regret = sum (actualBestProbability each pull) - sum (successes)
      
      var regretSoFar = regretThisTime;
      if (that.statsForEachPull.length>1) {
        regretSoFar += that.statsForEachPull[that.statsForEachPull.length-2].regretSoFar;
      }
      
//       
      // that.statsForEachPull.forEach(function(statistics) {
        // regretSoFar += statistics.regretThisTime;
      // });
      
      
      stats.regretSoFar = regretSoFar;
      stats.pullsSoFar = that.statsForEachPull.length;
      return stats;
      
    }
    
  };

this.gg = function(s) {
  that = this;
  //return s+9;
};

  function Bandit(initialActualProbability) {

    
    var that = this;
    
    
    that.getMeWithoutFunctions = function() {
     
     var thing = {};
     thing.stats=that.stats;
     thing.CurrentActualProbability = that.CurrentActualProbability;
     thing.currentDistributionParameters = that.currentDistributionParameters;
     
     return thing;
    }
    
    that.stats = {numberPulls:0,
                  numberSuccesses:0,
                  probabilityHistory:[]};
    
    that.currentDistributionParameters = {alpha:1, beta:1};

    that.CurrentActualProbability = initialActualProbability; //so it can be passed from web workers...

    that.getCurrentDistributionInfo = function() {
       return "alpha=" + currentDistributionParameters.alpha + ", beta=" + currentDistributionParameters.beta;
    };

    that.getCurrentActualProbability = function() {
      return that.stats.probabilityHistory[that.stats.probabilityHistory.length-1].probability;
    }
    //this is so that we can change the probability as it runs to see what happens
    that.setActualProbability = function(prob) {
      that.stats.probabilityHistory.push({probability:prob});
      that.CurrentActualProbability = prob; //so it can be passed from web workers...
    };
    
    //needs to be a more sophisticated object than this for this
    that.setActualProbability(initialActualProbability);
    
    that.getSampleFromCurrentDistribution = function(thingThatHasRandom) {
      
      var rnd = thingThatHasRandom.random(); //Math.random();
      var sample = jStat.beta.inv(rnd,
                                  that.currentDistributionParameters.alpha,
                                  that.currentDistributionParameters.beta);
                                  
      return sample;                            
    };
 
    //not sure will need this, but done this way to simplify if we use other distribution stuff   
    var updateDistributionParameters = function(wasSuccess) {
     
     if (wasSuccess) {
        that.currentDistributionParameters.alpha++;            
     }
     else {
        that.currentDistributionParameters.beta++;            
     }
      
    }
    //do a pull and register what happened, etc.
    //this returns true if it's a success, else false
    that.doPull = function(sample) {
           
      //console.log(sample);
      var pCurrent = that.getCurrentActualProbability();      
      //var sample = Math.random(); //T Dunning caught this howler... that.getSampleFromCurrentDistribution();

      that.stats.numberPulls++;
      
      var isSuccess = false;
      if (sample < pCurrent) {
        //success
        that.stats.numberSuccesses++;   
        isSuccess = true;
      }
      updateDistributionParameters(isSuccess);
      return isSuccess;
            
    };
    
  };

