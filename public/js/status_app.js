
 $(document).ready(function(){
    function viewModel() {
        var model = {
            currentView : ko.observable(),
            trainNumber : ko.observable(""),
            currentPosition : ko.observable(0),
            enableGetRunningStatus: ko.observable(false)

        };

        model.views = ko.observableArray(["Running Status", "PNR Status","Diverted Trains", "Rescheduled Trains", "Cancelled Trains"]);
        model.show_Contact = ko.computed(function() {
            return model.currentView() === "Running Status" ? true : false;
        });
        model.show_Home = ko.computed(function() {
            return model.currentView() === "PNR Status" ? true : false;
        });
        model.show_About = ko.computed(function() {
            return model.currentView() === "Diverted Trains" ? true : false;
        });
        model.show_About = ko.computed(function() {
            return model.currentView() === "Rescheduled Trains" ? true : false;
        });
        model.show_About = ko.computed(function() {
            return model.currentView() === "Cancelled Trains" ? true : false;
        });

        model.enableGetRunningStatus = ko.computed(function () {
            return (model.trainNumber().length>0);
        });

        model.getRunningStatus = getRunningStatus.bind(model)

        return model;
    }

     function getRunningStatus(model) {
        if(isNaN(model.trainNumber()))
        {
            alert("enter valid train number");
            return;
        }
         // 70/1400 *50px = x
         var cp = model.trainNumber() / 1400 * 350;
         cp = cp.toFixed(2)
        /* if (cp > 335) {
             cp = 335
         }*/
         model.currentPosition(cp)
     }

    var vm = new viewModel();
    ko.applyBindings(vm, document.getElementById("root"));
    Sammy(function () {
            this.get('#:view', function () {
                vm.currentView(this.params.view);
            });
        }).run('#Running Status');
})
