JARS.module('lang.transcollectors.Result').$import({
    '..Function': ['::noop', '::identity']
}).$export(function(noop, identity) {
    'use strict';

    var ResultCollector = {
        init: noop,

        step: function(acc, input) {
            return input;
        },

        result: identity
    };

    return ResultCollector;
});
