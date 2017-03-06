
 $(document).ready(function(){
    function viewModel() {
        var self = this;
        self.currentView = ko.observable();
        self.views = ko.observableArray(["Running Status", "PNR Status","Diverted Trains", "Rescheduled Trains", "Cancelled Trains"]);
        self.show_Contact = ko.computed(function() {
            return self.currentView() === "Running Status" ? true : false;
        });
        self.show_Home = ko.computed(function() {
            return self.currentView() === "PNR Status" ? true : false;
        });
        self.show_About = ko.computed(function() {
            return self.currentView() === "Diverted Trains" ? true : false;
        });
        self.show_About = ko.computed(function() {
            return self.currentView() === "Rescheduled Trains" ? true : false;
        });
        self.show_About = ko.computed(function() {
            return self.currentView() === "Cancelled Trains" ? true : false;
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
