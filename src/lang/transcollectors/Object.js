JARS.module('lang.transcollectors.Object').$import(['..Object', '..Function::identity']).$export(function(Obj, identity) {
    'use strict';

    var ObjectCollector = {
        init: function() {
            return new Obj();
        },

        step: function(acc, input) {
            acc[input[0]] = input[1];

            return acc;
        },

        result: identity
    };

    return ObjectCollector;
});
