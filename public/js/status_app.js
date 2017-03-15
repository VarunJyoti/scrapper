$(document).ready(function () {

    var isMobile = {
        Android: function () {
            return navigator.userAgent.match(/Android/i);
        },
        BlackBerry: function () {
            return navigator.userAgent.match(/BlackBerry/i);
        },
        iOS: function () {
            return navigator.userAgent.match(/iPhone|iPad|iPod/i);
        },
        Opera: function () {
            return navigator.userAgent.match(/Opera Mini/i);
        },
        Windows: function () {
            return navigator.userAgent.match(/IEMobile/i) || navigator.userAgent.match(/WPDesktop/i);
        },
        any: function () {
            return (isMobile.Android() || isMobile.BlackBerry() || isMobile.iOS() || isMobile.Opera() || isMobile.Windows());
        }
    };
    if (isMobile.any()) {
        if (isMobile.Android()) {
            alert("Android device")
        }
        if (isMobile.iOS()) {
            alert("apple store")
        }
    }
    function viewModel() {
        var runningData = null;

        function runningStatusModel() {
            var m = {
                trainName: ko.observable(""),
                runningTrainNo: ko.observable(""),
                currentPosition: ko.observable(0),
                currentLocation: ko.observable(""),
                enableGetRunningStatus: ko.observable(false),
                currentStation: ko.observable(),
                preStation: ko.observable(),
                nextStation: ko.observable(),
                departed: ko.observable(""),
                distance: ko.observable(0),
                distanceCovered: ko.observable(0),
                distanceToCover: ko.observable(0),
                arrivalText: ko.observable(""),
                runningTextCss: ko.observable(""),
                rakes: ko.observableArray()
            }
            return m;
        };
        var model = {
            currentView: ko.observable(),
            cancelledTrains: ko.observableArray(),
            rescheduledTrains: ko.observableArray(),
            divertedTrains: ko.observableArray(),
            runningStatusModel: runningStatusModel()
        };
        model.views = ko.observableArray(["Running Status", "PNR Status", "Diverted Trains", "Rescheduled Trains", "Cancelled Trains"]);

        /* model.show_Contact = ko.computed(function () {
         return model.currentView() === "Running Status" ? true : false;

         });
         model.show_Home = ko.computed(function () {
         return model.currentView() === "PNR Status" ? true : false;
         });
         model.show_About = ko.computed(function () {
         return model.currentView() === "Diverted Trains" ? true : false;
         });
         model.show_About = ko.computed(function () {
         return model.currentView() === "Rescheduled Trains" ? true : false;
         });
         model.show_About = ko.computed(function () {
         return model.currentView() === "Cancelled Trains" ? true : false;
         });
         */

        model.runningStatusModel.enableGetRunningStatus = ko.computed(function () {
            return (model.runningStatusModel.runningTrainNo().length > 0);
        });

        model.runningStatusModel.getRunningStatus = getRunningStatus.bind(model)
        model.getCancelledTrains = getCancelledTrains.bind(model)
        model.getDivertedTrains = getDivertedTrains.bind(model)
        model.getRescheduledTrains = getRescheduledTrains.bind(model)
        model.runningStatusModel.setRakeBasedData = setRakeBasedData;

        return model;
    }

    function setArrivalText(model) {

        var delayArr = model.nextStation().delayArr;
        if (delayArr === 0) {
            model.arrivalText("ON <br><br>Time");
            model.runningTextCss("green");
        } else if (delayArr > 0) {
            model.arrivalText(delayArr + " mins <br><br>Late");
            model.runningTextCss("red");
        } else if (delayArr < 1) {
            model.arrivalText(delayArr + " mins <br><br>Early");
            model.runningTextCss("orange");
        }
    }

    function getRunningStatus(m) {
        var model = m.runningStatusModel;
        $("#overlay").show();
        $.get("/scrapping/" + model.runningTrainNo(), function (data) {
                $("#overlay").hide();
                runningData = data[0];
                model.rakes(runningData.rakes);
                model.trainName(model.runningTrainNo() + " " + data[0].trainName);
                var rake = runningData.rakes[0];
                setRakeBasedData(rake, model);
            }
        )
    }

    function setRakeBasedData(rake, model) {
        model.currentStation(rake.curStn);
        var toStation = runningData.to;
        var isFound = false;
        var preStation = rake.stations[0];
        $.each(rake.stations, function (index, st) {
            if (isFound && st.stoppingStn) {
                // find next stopping station
                model.nextStation(st);
                return false;
            }

            if (!isFound && st.stnCode == rake.curStn) {
                isFound = true;
                if (st.stnCode == toStation) {
                    //reach destination
                    model.nextStation(st);
                    return false;
                }
            }
            if (st.stoppingStn && !isFound) {
                preStation = st;
            }
        });

        model.preStation(preStation)


        model.currentLocation(( model.nextStation().distance - model.preStation().distance) + " Kms from " + model.nextStation().stnCode);

        if (model.currentStation().stnCode == model.preStation().stnCode) {
            model.currentPosition("0%")
        }
        else if (model.currentStation().stnCode == model.nextStation().stnCode) {
            model.currentPosition("99%")
            model.currentLocation("");
        }
        else if (model.currentStation().dep) {
            model.currentPosition("75%");
        }
        else if (model.currentStation().arr) {
            model.currentPosition("50%")
        } else {
            model.currentPosition("25%")
        }

        setArrivalText(model);
    }

    function getCancelledTrains(m) {
        m.cancelledTrains([])
        $("#overlay").show();
        $.get("/getCancelled", function (data) {
            $("#overlay").hide();
            data.allCancelledTrains.forEach(function (ct) {
                var t = {
                    startDate: ct.startDate,
                    trainDstn: ct.trainDstn,
                    trainName: ct.trainName,
                    trainNo: ct.trainNo,
                    trainSrc: ct.trainSrc,
                    trainType: ct.trainType
                }
                m.cancelledTrains.push(t);
            })
        });
    }

    function getDivertedTrains(m) {
        m.divertedTrains([]);
        $("#overlay").show();
        $.get("/getDiverted", function (data) {
            $("#overlay").hide();
            data.trains.forEach(function (ct) {
                var t = {
                    startDate: ct.startDate,
                    trainDstn: ct.trainDstn,
                    trainName: ct.trainName,
                    trainNo: ct.trainNo,
                    trainSrc: ct.trainSrc,
                    divertedFrom: ct.divertedFrom,
                    divertedTo: ct.divertedTo,
                    trainType: ct.trainType
                }
                m.divertedTrains.push(t);
            })
        })
    }

    function getRescheduledTrains(m) {
        m.rescheduledTrains([]);
        $("#overlay").show();
        $.get("/getRescheduled", function (data) {
            $("#overlay").hide();
            data.trains.forEach(function (ct) {
                var t = {
                    startDate: ct.startDate,
                    trainDstn: ct.trainDstn,
                    trainName: ct.trainName,
                    trainNo: ct.trainNo,
                    trainSrc: ct.trainSrc,
                    trainType: ct.trainType,
                    startDate: ct.startDate,
                    newStartDate: ct.newStartDate,
                    actDep: ct.actDep,
                    schDep: ct.schDep,

                }
                m.rescheduledTrains.push(t);
            })
        });
    }

    var vm = new viewModel();

    ko.applyBindings(vm, document.getElementById("root"));
    Sammy(function () {
        this.get('#:view', function () {
            vm.currentView(this.params.view);
        });
    }).run('#Running Status');
})

function getData123() {
    return [{
        "trainDataFound": "trainRunningDataFound",
        "trainNo": "12241",
        "trainName": "CDG-ASR SUPERFAST",
        "from": "CDG",
        "to": "ASR",
        "schArrTime": "21:25",
        "schDepTime": "17:10",
        "dayCnt": 0,
        "runsOn": "1111111",
        "trainType": "SUF",
        "prfFlag": "0",
        "vldFrm": "1 Oct 2016",
        "vldTo": "-",
        "trainSchedule": {
            "stations": [{
                "stnCode": "CDG",
                "arrTime": "00:00",
                "depTime": "17:10",
                "dayCnt": 0,
                "distance": 0,
                "pfNo": 0
            }, {
                "stnCode": "SASN",
                "arrTime": "17:20",
                "depTime": "17:22",
                "dayCnt": 0,
                "distance": 11,
                "pfNo": 0
            }, {
                "stnCode": "LDH",
                "arrTime": "18:52",
                "depTime": "18:57",
                "dayCnt": 0,
                "distance": 112,
                "pfNo": 0
            }, {
                "stnCode": "JUC",
                "arrTime": "19:48",
                "depTime": "19:53",
                "dayCnt": 0,
                "distance": 169,
                "pfNo": 0
            }, {
                "stnCode": "BEAS",
                "arrTime": "20:28",
                "depTime": "20:30",
                "dayCnt": 0,
                "distance": 205,
                "pfNo": 0
            }, {"stnCode": "ASR", "arrTime": "21:25", "depTime": "00:00", "dayCnt": 0, "distance": 247, "pfNo": 0}]
        },
        "rakes": [{
            "startDate": "14 Mar 2017",
            "startDayDiff": "0",
            "departed": true,
            "curStn": "HMR",
            "terminated": false,
            "idMsg": "0",
            "cncldFrmStn": "null",
            "cncldToStn": "null",
            "totalJourney": "3 hrs 20 min",
            "lastUpdated": "14 Mar 2017 20:42",
            "stations": [{
                "stnCode": "CDG",
                "actArr": "00:00",
                "actDep": "17:10",
                "dayCnt": 0,
                "schArrTime": "00:00",
                "schDepTime": "17:10",
                "schDayCnt": 0,
                "delayArr": 0,
                "delayDep": 0,
                "arr": false,
                "dep": true,
                "distance": 0,
                "journeyDate": "14 Mar 2017",
                "actArrDate": "14 Mar 2017",
                "actDepDate": "14 Mar 2017",
                "dayDiff": "0",
                "stoppingStn": true,
                "dvrtdStn": false,
                "travelled": true,
                "updWaitngArr": false,
                "updWaitngDep": false,
                "pfNo": 0
            }, {
                "stnCode": "SASN",
                "actArr": "17:25",
                "actDep": "17:27",
                "dayCnt": 0,
                "schArrTime": "17:20",
                "schDepTime": "17:22",
                "schDayCnt": 0,
                "delayArr": 5,
                "delayDep": 5,
                "arr": true,
                "dep": true,
                "distance": 11,
                "journeyDate": "14 Mar 2017",
                "actArrDate": "14 Mar 2017",
                "actDepDate": "14 Mar 2017",
                "dayDiff": "0",
                "stoppingStn": true,
                "dvrtdStn": false,
                "travelled": true,
                "updWaitngArr": false,
                "updWaitngDep": false,
                "pfNo": 0
            }, {
                "stnCode": "LDH",
                "actArr": "19:08",
                "actDep": "19:21",
                "dayCnt": 0,
                "schArrTime": "18:52",
                "schDepTime": "18:57",
                "schDayCnt": 0,
                "delayArr": 16,
                "delayDep": 24,
                "arr": true,
                "dep": true,
                "distance": 112,
                "journeyDate": "14 Mar 2017",
                "actArrDate": "14 Mar 2017",
                "actDepDate": "14 Mar 2017",
                "dayDiff": "0",
                "stoppingStn": true,
                "dvrtdStn": false,
                "travelled": true,
                "updWaitngArr": false,
                "updWaitngDep": false,
                "pfNo": 5
            }, {
                "stnCode": "JUC",
                "actArr": "20:09",
                "actDep": "20:14",
                "dayCnt": 0,
                "schArrTime": "19:48",
                "schDepTime": "19:53",
                "schDayCnt": 0,
                "delayArr": 21,
                "delayDep": 21,
                "arr": true,
                "dep": true,
                "distance": 169,
                "journeyDate": "14 Mar 2017",
                "actArrDate": "14 Mar 2017",
                "actDepDate": "14 Mar 2017",
                "dayDiff": "0",
                "stoppingStn": true,
                "dvrtdStn": false,
                "travelled": true,
                "updWaitngArr": false,
                "updWaitngDep": false,
                "pfNo": 0
            }, {
                "stnCode": "HMR",
                "actArr": "20:30",
                "actDep": "20:30",
                "dayCnt": 0,
                "schArrTime": "20:14",
                "schDepTime": "20:14",
                "schDayCnt": 0,
                "delayArr": 16,
                "delayDep": 16,
                "arr": true,
                "dep": true,
                "distance": 190,
                "journeyDate": "14 Mar 2017",
                "actArrDate": "14 Mar 2017",
                "actDepDate": "14 Mar 2017",
                "dayDiff": "0",
                "stoppingStn": false,
                "dvrtdStn": false,
                "travelled": true,
                "updWaitngArr": false,
                "updWaitngDep": false,
                "pfNo": 0
            }, {
                "stnCode": "BEAS",
                "actArr": "20:39",
                "actDep": "20:40",
                "dayCnt": 0,
                "schArrTime": "20:28",
                "schDepTime": "20:30",
                "schDayCnt": 0,
                "delayArr": 11,
                "delayDep": 10,
                "arr": false,
                "dep": false,
                "distance": 205,
                "journeyDate": "14 Mar 2017",
                "actArrDate": "14 Mar 2017",
                "actDepDate": "14 Mar 2017",
                "dayDiff": "0",
                "stoppingStn": true,
                "dvrtdStn": false,
                "travelled": true,
                "updWaitngArr": false,
                "updWaitngDep": false,
                "pfNo": 0
            }, {
                "stnCode": "ASR",
                "actArr": "21:25",
                "actDep": "00:00",
                "dayCnt": 0,
                "schArrTime": "21:25",
                "schDepTime": "00:00",
                "schDayCnt": 0,
                "delayArr": 0,
                "delayDep": 0,
                "arr": false,
                "dep": false,
                "distance": 247,
                "journeyDate": "14 Mar 2017",
                "actArrDate": "14 Mar 2017",
                "actDepDate": "",
                "dayDiff": "0",
                "stoppingStn": true,
                "dvrtdStn": false,
                "travelled": true,
                "updWaitngArr": false,
                "updWaitngDep": false,
                "pfNo": 0
            }],
            "totalLateMins": 21,
            "isRunningDataAvailable": true
        }, {
            "startDate": "13 Mar 2017",
            "startDayDiff": "-1",
            "departed": true,
            "curStn": "ASR",
            "terminated": true,
            "idMsg": "0",
            "cncldFrmStn": "null",
            "cncldToStn": "null",
            "totalJourney": "3 hrs 55 min",
            "lastUpdated": "13 Mar 2017 21:10",
            "stations": [{
                "stnCode": "CDG",
                "actArr": "00:00",
                "actDep": "17:10",
                "dayCnt": 0,
                "schArrTime": "00:00",
                "schDepTime": "17:10",
                "schDayCnt": 0,
                "delayArr": 0,
                "delayDep": 0,
                "arr": false,
                "dep": true,
                "distance": 0,
                "journeyDate": "13 Mar 2017",
                "actArrDate": "13 Mar 2017",
                "actDepDate": "13 Mar 2017",
                "dayDiff": "-1",
                "stoppingStn": true,
                "dvrtdStn": false,
                "travelled": true,
                "updWaitngArr": false,
                "updWaitngDep": false,
                "pfNo": 0
            }, {
                "stnCode": "SASN",
                "actArr": "17:25",
                "actDep": "17:27",
                "dayCnt": 0,
                "schArrTime": "17:20",
                "schDepTime": "17:22",
                "schDayCnt": 0,
                "delayArr": 5,
                "delayDep": 5,
                "arr": true,
                "dep": true,
                "distance": 11,
                "journeyDate": "13 Mar 2017",
                "actArrDate": "13 Mar 2017",
                "actDepDate": "13 Mar 2017",
                "dayDiff": "-1",
                "stoppingStn": true,
                "dvrtdStn": false,
                "travelled": true,
                "updWaitngArr": false,
                "updWaitngDep": false,
                "pfNo": 0
            }, {
                "stnCode": "LDH",
                "actArr": "18:52",
                "actDep": "19:02",
                "dayCnt": 0,
                "schArrTime": "18:52",
                "schDepTime": "18:57",
                "schDayCnt": 0,
                "delayArr": 0,
                "delayDep": 5,
                "arr": true,
                "dep": true,
                "distance": 112,
                "journeyDate": "13 Mar 2017",
                "actArrDate": "13 Mar 2017",
                "actDepDate": "13 Mar 2017",
                "dayDiff": "-1",
                "stoppingStn": true,
                "dvrtdStn": false,
                "travelled": true,
                "updWaitngArr": false,
                "updWaitngDep": false,
                "pfNo": 5
            }, {
                "stnCode": "JUC",
                "actArr": "19:47",
                "actDep": "19:53",
                "dayCnt": 0,
                "schArrTime": "19:48",
                "schDepTime": "19:53",
                "schDayCnt": 0,
                "delayArr": -1,
                "delayDep": 0,
                "arr": true,
                "dep": true,
                "distance": 169,
                "journeyDate": "13 Mar 2017",
                "actArrDate": "13 Mar 2017",
                "actDepDate": "13 Mar 2017",
                "dayDiff": "-1",
                "stoppingStn": true,
                "dvrtdStn": false,
                "travelled": true,
                "updWaitngArr": false,
                "updWaitngDep": false,
                "pfNo": 0
            }, {
                "stnCode": "BEAS",
                "actArr": "20:20",
                "actDep": "20:30",
                "dayCnt": 0,
                "schArrTime": "20:28",
                "schDepTime": "20:30",
                "schDayCnt": 0,
                "delayArr": -8,
                "delayDep": 0,
                "arr": true,
                "dep": true,
                "distance": 205,
                "journeyDate": "13 Mar 2017",
                "actArrDate": "13 Mar 2017",
                "actDepDate": "13 Mar 2017",
                "dayDiff": "-1",
                "stoppingStn": true,
                "dvrtdStn": false,
                "travelled": true,
                "updWaitngArr": false,
                "updWaitngDep": false,
                "pfNo": 0
            }, {
                "stnCode": "ASR",
                "actArr": "21:05",
                "actDep": "00:00",
                "dayCnt": 0,
                "schArrTime": "21:25",
                "schDepTime": "00:00",
                "schDayCnt": 0,
                "delayArr": -20,
                "delayDep": 0,
                "arr": true,
                "dep": false,
                "distance": 247,
                "journeyDate": "13 Mar 2017",
                "actArrDate": "13 Mar 2017",
                "actDepDate": "",
                "dayDiff": "-1",
                "stoppingStn": true,
                "dvrtdStn": false,
                "travelled": true,
                "updWaitngArr": false,
                "updWaitngDep": false,
                "pfNo": 0
            }],
            "totalLateMins": -20,
            "isRunningDataAvailable": true
        }]
    }]
}
