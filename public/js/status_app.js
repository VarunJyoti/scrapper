$(document).ready(function () {

    function viewModel() {
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
                runningTextCss: ko.observable("")
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

        return model;
    }

    function setArrivalText(model){
        
        var delayArr = model.nextStation().delayArr;
        if(delayArr === 0){
            model.arrivalText("ON <br><br>Time");
            model.runningTextCss("green");
        }else if(delayArr > 0){
            model.arrivalText(delayArr+" mins <br><br>Late");
            model.runningTextCss("red");
        }else if(delayArr<1){
            model.arrivalText(delayArr+" mins <br><br>Early");
            model.runningTextCss("orange");
        }
    }

    function getRunningStatus(m) {
        var model = m.runningStatusModel;
        // 70/1400 *50px = x

        $.get("/scrapping/" + model.runningTrainNo(), function (data) {
                console.log(data);
                var rake = data[0].rakes[0];
                model.trainName(model.runningTrainNo()+ " " + data[0].trainName);
                model.currentStation(rake.curStn)
                var toStation = data[0].to;
                var preStation = rake.stations[0];
                var stoppingStations = rake.stations.filter(function (s) {
                    return (s.stoppingStn)
                });
                var nextStationIndex = 0;
                stoppingStations.foreach(function (st, index) {
                    if (st.stnCode == rake.curStn) {
                        model.currentStation(st);
                        nextStationIndex = (st.stnCode == toStation) ? index : index + 1;
                    }
                    if (nextStationIndex == 0) {
                        preStation = st;
                    }
                })
                model.preStation(preStation)
                model.nextStation(stoppingStations[nextStationIndex]);

                model.currentLocation(( model.nextStation().distance - model.preStation().distance) + " from " + model.nextStation().stnCode);

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
        )
    }

    function getCancelledTrains(m) {
        $.get("/getCancelled", function (data) {
            console.log(data);
            m.cancelledTrains([])
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
        $.get("/getDiverted", function (data) {
            console.log(data);
            m.divertedTrains([]);
            debugger;
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
        $.get("/getRescheduled", function (data) {
            console.log(data);
            m.rescheduledTrains([]);
            debugger;
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
