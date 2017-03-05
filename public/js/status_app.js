
 $(document).ready(function(){
    function viewModel() {
        var self = this;
        self.currentView = ko.observable();
        self.views = ko.observableArray(["Running", "PNR", "Cancelled"]);
        self.show_Contact = ko.computed(function() {
            return self.currentView() === "Running" ? true : false;
        });
        self.show_Home = ko.computed(function() {
            return self.currentView() === "PNR" ? true : false;  
        });
        self.show_About = ko.computed(function() {
            return self.currentView() === "Cancelled" ? true : false;
        });    
    }

    var vm = new viewModel();
    ko.applyBindings(vm, document.getElementById("root"));
    Sammy(function () {
            this.get('#:view', function () {
                vm.currentView(this.params.view);
            });
        }).run('#Home');
})
