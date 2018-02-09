JARS.module('lang.transcollectors.Array').$import(['..Array', '..Function::identity']).$export(function(Arr, identity) {
    'use strict';

    var ArrayCollector = {
        init: function() {
            return new Arr();
        },

        step: function(acc, input) {
            acc.push(input);

            return acc;
        },

        result: identity
    };

    return ArrayCollector;
});
