

importScripts("jstat.js", "banditcore.js");
//importScripts("vendor/seedrandom.js");
importScripts("vendor/mersennetwister.js");

//Math.seedrandom(); 
  


self.mersenneTwister = new MersenneTwister();
//var randomNumber = m.random();
//this will have the generic stuff
//importScripts("banditcore.js");

var STOPPED = 0;
var RUNNING = 1;
var PAUSED = 2;

self.status = STOPPED;
self.BanditManager = null;

// self.startRunning = function() { 
 // setTimeout('doPull()',1000);  
// }

self.clearTimers = function() {
    
     clearTimeout(self.theTimerID);
}

self.setTimerForNextCall = function() {     
  
      if (self.status ==PAUSED) {
        //console.log("paused");
              self.clearTimers();
            }
      else {
        self.theTimerID = setTimeout(function() {
            var stats = self.BanditManager.doPull(self.mersenneTwister);
            stats.randomNumbersChosenForPulls = self.BanditManager.randomNumbersChosenForPulls;
            self.postMessage({message:'update', 
                                    stats:stats, 
                                    theBandits:self.BanditManager.getBanditsNoFunctions(), 
                                    randomNumbersForPull: self.BanditManager.randomNumbersChosenForPulls
                                     }); //getBandits()});
            //self.postMessage({message:'update', stats:stats, theBandits:self.BanditManager.getBandits()});
            clearTimeout(self.theTimerID);
            
            
            if (self.maxPulls > 0) {
              if (self.BanditManager.getNumberPullsSoFar() >= self.maxPulls) {
                self.postMessage({message:'done'});
                self.close();
              }
              else {
                self.setTimerForNextCall();
              }
            }
            else {
                self.setTimerForNextCall();
            }
            
        }, self.currentUpdateInterval_ms);
      }
    };


self.addEventListener('message', function(e) {

  var data = e.data;
  
  var options = data.options;
  
  //console.log(e);
  //var theFileContents = data.fileContents;
  
  //self.postMessage( {"message":"hello"});
  switch (data.cmd) {
    
    case 'updateParameters':
      var banditIndex = data.banditIndex;
      var val = data.val;
      //console.log("adsad");
      self.BanditManager.setActualProbabilityForBandit(banditIndex,val);
      //send an update back so that we can have its renderer do its thing      
      
      break;
    
    case 'start':
      //self.postMessage('Starting...');
      
      self.status = RUNNING;
      
      //var t = jStat.beta.inv(0.1,1,1);
      
      var initialProbabilities = data.initialProbabilities;
      
      if (data.maxPulls) {
       self.maxPulls = data.maxPulls; 
      }
      else {
       self.maxPulls = -1; 
      }
      
      self.BanditManager = new gBanditManager(initialProbabilities); //initialProbabilities);
      self.currentUpdateInterval_ms = data.currentUpdateInterval_ms;
      if (!self.currentUpdateInterval_ms) {
       self.currentUpdateInterval_ms = 1000; 
      }
      //set timeout and do stuff
      self.setTimerForNextCall();      
      break;
    case 'pause':
      self.status = PAUSED;
      self.clearTimers();
      break;
    case 'resume':
      self.status = RUNNING;
      self.setTimerForNextCall();
      break;
    case 'stop':
      self.status = STOPPED;
      clearTimeout(self.theTimerID);
      self.close();
    
  };
},false);






