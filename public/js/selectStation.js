'use strict';
$(document).ready(function () {
    function filter(term, stations) {
        if (term === '') {
            return stations;
        }
        var t = term.toLowerCase();
        return stations.filter(function (s) {
            return s.code.startsWith(t) ||s.station.toLowerCase().startsWith(t);
        });
    }

    function valueToUnit(value) {
        var u = stationCache().find(function (element) {
            return element.value === value;
        })
        return u ? u.label : value;
    }

    var stationCache = ko.observable();

   /* var stationCodes = [{code: "12723", station: "Andhra Pradesh Express"},
        {code: "22416", station: "Andhra Pradesh Express"}, {code: "12724", station: "Andhra Pradesh Express"},
        {code: "12707", station: "Andhra Pradesh Sampark Kranti"}, {code: "15609", station: "Abadh Assam Express"},
        {code: "15909", station: "Abadh Assam Express"}, {code: "18242", station: "Abkp Durg Passenger E"},
        {code: "11266", station: "Abkp Jbp Express"}, {code: "54703", station: "Abs Ju Passengr"}];
*/
    function prepareStationsCache(stations) {
        var _cache = stationCodes.map(function (s) {
            return  Object.assign(s,
             {
                label: (s.code + " | " + s.station),
                value: s.code
            });
        });
        stationCache(_cache);
    }

    prepareStationsCache(stationCodes);
    ko.bindingHandlers.inputStation = {
        init: function (element, value, parse, model, ctx) {
            var v = value();
            var input = $(element);
            var observable = model[v.obj][v.key]
            input.change(function () {
                observable($(this).val());
            })

            input.on('focus', function () {
                $(this).autocomplete('search');
            }).autocomplete({
                delay: 0,
                minLength: 3,
                close: function (e, o) {
                    input.trigger('change');
                },
                autoFocus: true,
                focus: function () {
                    return false;
                },
                open: function () {
                    $(this).data("uiAutocomplete").menu.element
                        .addClass("station-autocomplete")
                        .outerWidth(input.outerWidth());
                },
                select: function (e, ui) {
                    $(this).val(ui.item.value);
                    return false;
                },
                source: function (request, response) {
                    return response(filter(request.term, stationCache()));
                }
            }).prop('disabled', false)

        },
        update: function (element, value, all, model, ctx) {
            var v = value();

            //update input state on update triggered by serviceLineCompletion (if required)
            var modelValue = model[v.obj][v.key]();
            var inputValue = $(element).val();

            if ((modelValue) != inputValue) {
                $(element).val(modelValue);
            }
        }
    }
})



