var express = require('express');
var router = express.Router();

var scrapper = require('./../scrapper');
var stationsJson = require('../stations.json');
/* GET users listing. */
router.get('/scrapping/:trainNo', function (req, res, next) {
    var trainNo = req.params.trainNo || "";
    scrapper(trainNo,function(result){
		var resWithName = setStationName(result)
        res.json(resWithName);
    });
});

function setStationName(res) {
	res[0].rakes.forEach(function (rk) {
		rk.stations.forEach(function (st) {
			st.stnName = stationsJson[st.stnCode] || st.stnCode;
		});
	})
	return res;
}
router.get('/scrapping/:trainNo/schedule', function (req, res, next) {
    var trainNo = req.params.trainNo || "";
    scrapper(trainNo,function(result){
    	for(var i=0; i< result[0].rakes.length; i++){
    		var stations = result[0].rakes[i].stations;
    		result[0].rakes[i].stations = [];
    		
    		var curStationCode = result[0].rakes[i].curStn;
    		var prevStation = null;
    		var nextStation = null;
    		
    		
    		for(var j=0; j < stations.length; j++){
    			if(stations[j].stnCode == curStationCode){
    				curStation = stations[j];
    				if(j == 0){
    					prevStation = null;
    					break;
    				}else{
    					prevStation = stations[j-1];
    					break;
    				}
    				
    			}
    		}
    		for(var j=0; j < stations.length; j++){
    			if(stations[j].stnCode == curStationCode){

    				if(j == stations.length-1){
    					nextStation = null;
    					break;
    				}else{
    					nextStation = stations[j+1];
    					break;
    				}	
    			}
    		}
    		if(prevStation){
    			result[0].rakes[i].stations.push(prevStation);
    		}
    		if(curStation){
    			result[0].rakes[i].stations.push(curStation);
    		}
    		if(nextStation){
    			result[0].rakes[i].stations.push(nextStation);
    		}

    	}
        res.json(result);
    });
});
router.get('/scrapping/:trainNo/status', function (req, res, next) {
    var trainNo = req.params.trainNo || "";
    scrapper(trainNo,function(result){
    	var instances = [];
    	for(var i=0; i< result[0].rakes.length; i++){
    		var instance = {};
    		var stations = result[0].rakes[i].stations;
    		var curStationCode = result[0].rakes[i].curStn;
    		var prevStation = null;
    		var nextStation = null;
    		
    		
    		for(var j=0; j < stations.length; j++){
    			if(stations[j].stnCode == curStationCode){
    				curStation = stations[j];
    				if(j == 0){
    					prevStation = stations[j];
    					break;
    				}else{
    					prevStation = stations[j-1];
    					break;
    				}
    				
    			}
    		}
    		for(var j=0; j < stations.length; j++){
    			if(stations[j].stnCode == curStationCode){
    				if(j == stations.length-1){
    					nextStation = stations[j];
    					break;
    				}else{
    					nextStation = stations[j+1];
    					break;
    				}	
    			}
    		}

    		instance.startDate = result[0].rakes[i].startDate;
    		instance.origin = stations[0].stnCode;
    		instance.current_station = curStationCode;
    		instance.is_current_station_stopping_station = result[0].rakes[i].stations.find(function(currentValue){
    			return currentValue.stnCode ==  result[0].rakes[i].curStn;
    		}).stoppingStn;
    		instance.prev_station_code = prevStation.stnCode;
    		instance.km_from_prev = curStation.distance - prevStation.distance;
    		instance.next_station_code = nextStation.stnCode;
    		instance.km_from_next = nextStation.distance - curStation.distance;
 			instance.running_status = getArrivalStatus(nextStation);
 			instance.late_mins = nextStation.delayArr;
 			instances.push(instance);
    	}
        res.json({
           instances: instances
        });
    });
});
router.get('/scrapping/:trainNo/:date', function (req, res, next) {
    var trainNo = req.params.trainNo || "";
    var date = req.params.date || "";
    scrapper(trainNo,function(result){
    	result[0].rakes = result[0].rakes.filter(function(currentValue){
            return currentValue.startDate == date;
    	})
        res.json(result);
    });
});
function getArrivalStatus(nextStation) {
    var delayArr = nextStation.delayArr;
    if (delayArr === 0) {
        return "RT";
    } else if (delayArr > 0) {
       return "Late";
    } else if (delayArr < 1) {
        return "Early";
    }
}


module.exports = router;
