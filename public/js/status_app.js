$(document).ready(function () {

    function viewModel() {
        var model = {
            currentView: ko.observable(),
            runningTrainNo: ko.observable(""),
            currentPosition: ko.observable(0),
            currentLocation: ko.observable(""),
            enableGetRunningStatus: ko.observable(false),
            stationFrom: ko.observable(""),
            stationTo: ko.observable(""),
            departed: ko.observable(""),
            distance: ko.observable(0),
            distanceCovered: ko.observable(0),
            distanceToCover: ko.observable(0)

        };

        model.views = ko.observableArray(["Running Status", "PNR Status", "Diverted Trains", "Rescheduled Trains", "Cancelled Trains"]);

        model.show_Contact = ko.computed(function () {
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

        model.enableGetRunningStatus = ko.computed(function () {
            return (model.runningTrainNo().length > 0);
        });

        model.getRunningStatus = getRunningStatus.bind(model)

        return model;
    }

    function getRunningStatus(model) {

        // 70/1400 *50px = x

        $.get("/scrapping/" + model.runningTrainNo(), function (data) {
            console.log(data);
            model.stationFrom(data[0].from);
            model.stationTo(data[0].to);
            var departed = data[0].rakes[0].departed;
            if (departed) {
                var distance = data[0].trainSchedule.stations[data[0].trainSchedule.stations.length - 1].distance;
                var rakes = data[0].rakes[0].stations.filter(function (st) {
                    return st.dep == false
                });
                var distanceCovered = rakes[0].distance;
                model.distance(distance)
                model.distanceCovered(distanceCovered)
                model.distanceToCover(distance - distanceCovered)

                var cp = model.distanceCovered() / model.distance() * 350;
                cp = cp.toFixed(2)
                model.currentPosition(cp);
                model.currentLocation(model.distanceToCover() + " from " + model.stationTo());
            }
            else {
                // not yet departed
            }
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
