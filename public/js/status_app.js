$(document).ready(function () {
     $('#fullpage').fullpage({
         slideSelector: '.fullslide',
         verticalCentered: false
     });

    
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
                currentStationStatus: ko.observable(),
                preStation: ko.observable(),
                nextStation: ko.observable(),
                departed: ko.observable(""),
                distance: ko.observable(0),
                distanceCovered: ko.observable(0),
                distanceToCover: ko.observable(0),
                arrivalText: ko.observable(""),
                runningTextCss: ko.observable(""),
                rakes: ko.observableArray(),
                runningStatusLoaded:ko.observable(false)
            }
            return m;
        };

        function pnrModel() {
            var m = {
                trainName: ko.observable("Rajdhani Express"),
                pnrNo: ko.observable(""),
                enableGetPNRStatus: ko.observable(false),
                date: ko.observable("2/26/2017"),
                from: ko.observable("JUC"),
                to: ko.observable("ASR"),
                passengers: ko.observableArray([{
                    name: "varun",
                    status: "CNF",
                    seat: "A1"
                },{
                    name: "fdf",
                    status: "NF",
                    seat: "B25"
                }])
            }
            return m;
        };
        var model = {
            currentView: ko.observable(),
            cancelledTrains: ko.observableArray(),
            rescheduledTrains: ko.observableArray(),
            divertedTrains: ko.observableArray(),
            runningStatusModel: runningStatusModel(),
            pnrModel: pnrModel()
        };
        model.views = ko.observableArray(["Running Status", "Diverted Trains", "Rescheduled Trains", "Cancelled Trains"]);

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
        });*/

        ko.computed(function () {
            var cv = model.currentView();
            switch (cv) {
                case "Diverted Trains":
                    getDivertedTrains(model);
                    break;
                case "Rescheduled Trains":
                    getRescheduledTrains(model);
                    break;
                case "Cancelled Trains":
                    getCancelledTrains(model);
                    break;
                case "Running Status":
                    break

                default:
                    break;
            }
        });


        model.runningStatusModel.enableGetRunningStatus = ko.computed(function () {
            return (model.runningStatusModel.runningTrainNo().length > 0);
        });
        model.pnrModel.enableGetPNRStatus = ko.computed(function () {
            return (model.pnrModel.pnrNo().length > 0);
        });

        model.runningStatusModel.getRunningStatus = getRunningStatus.bind(model)
        model.getCancelledTrains = getCancelledTrains.bind(model)
        model.getDivertedTrains = getDivertedTrains.bind(model)
        model.getRescheduledTrains = getRescheduledTrains.bind(model)
        model.runningStatusModel.setRakeBasedData = setRakeBasedData;
        model.pnrModel.getPNRStatus = getPNRStatus.bind(model);
        model.goToSecondSection = function(){
            $.fn.fullpage.moveSectionDown();
        }

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
            model.arrivalText(Math.abs(delayArr) + " mins <br><br>Early");
            model.runningTextCss("orange");
        }
    }
    function getPNRStatus(m){
        var model = m.pnrModel;
    }

    function getRunningStatus(m) {
        var model = m.runningStatusModel;
        model.runningStatusLoaded(false)
        $("#overlay").show();
        ajaxCall("/scrapping/" + model.runningTrainNo(),
            function (data) {
                $("#overlay").hide();
                setTimeout(function(){
                    $(".btn-group-sm .btn:first").focus();
                }, 100);
                
                runningData = data[0];
                model.rakes(runningData.rakes);
                model.trainName(model.runningTrainNo() + " " + data[0].trainName);
                var rake = runningData.rakes[0];
                setRakeBasedData(rake, model);
                model.runningStatusLoaded(true)
            },
            function () {
                alert("Train number incorrect or Server too busy. Please try after some time.");
                $("#overlay").hide();
            });
    }

    function setRakeBasedData(rake, model) {
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
                model.currentStation(st);
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

        model.currentStationStatus("Not yet departed from " + model.currentStation().stnCode);
        if (model.currentStation().stnCode == model.preStation().stnCode) {
            model.currentPosition("0%")
        }
        else if (model.currentStation().stnCode == model.nextStation().stnCode) {
            model.currentPosition("99%")
            model.currentLocation("");
            model.currentStationStatus("Arrived at " + model.currentStation().stnCode)
        }
        else if (model.currentStation().dep) {
            model.currentPosition("75%");
            model.currentStationStatus("Departed from " + model.currentStation().stnCode)
        }
        else if (model.currentStation().arr){
            model.currentPosition("50%")
        } else {
            model.currentPosition("25%")
        }

        setArrivalText(model);
    }

    function getCancelledTrains(m) {
        m.cancelledTrains([])
        $("#overlay").show();
        ajaxCall("/getCancelled", function (data) {
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
        }, serverBusy);
    }

    function getDivertedTrains(m) {
        m.divertedTrains([]);
        $("#overlay").show();
        ajaxCall("/getDiverted", function (data) {
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
        }, serverBusy)
    }

    function getRescheduledTrains(m) {
        m.rescheduledTrains([]);
        $("#overlay").show();
        ajaxCall("/getRescheduled",
            function (data) {
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
                        schDep: ct.schDep
                    }
                    m.rescheduledTrains.push(t);
                })
            }, serverBusy);
    }

    var serverBusy = function () {
        alert("Server too busy. Please try after some time.");
        $("#overlay").hide();
    }

    function ajaxCall(url, success, failure) {
        $.ajax({
            url: url,
            success: success,
            error: failure,
            timeout: 9000
        })
    }


    var vm = new viewModel();

    ko.applyBindings(vm, document.getElementById("root"));
    Sammy(function () {
        this.get('#:view', function () {
            vm.currentView(this.params.view);
        });
    }).run('#Running Status');
})

