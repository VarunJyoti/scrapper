  function createModel() {
                var model = {};
                model.places = ko.observableArray(['London', 'Paris', 'Tokyo']);

                // The current item will be passed as the first parameter, so we know which place to remove
                model.removePlace = function (place) {
                    model.places.remove(place)
                }

                model.myItems = ko.observableArray(['A', 'B', 'C']);
                model.yellowFadeIn = function (element, index, data) {
                    $(element).fadeIn(3000).css({'background-color': 'yellow'});
                    $(element).filter("li")
                        .animate({backgroundColor: 'yellow'}, 2000)
                        .animate({backgroundColor: 'white'}, 8000);
                };
                model.addItem = function () {
                    model.myItems.push('New item');
                }
                return model
            }



$(function () {
    var target = document.getElementById('root')
    ko.applyBindings(createModel(),target);
});

