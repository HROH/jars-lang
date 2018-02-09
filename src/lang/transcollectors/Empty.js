JARS.module('lang.transcollectors.Empty').$import('..Function::noop').$export(function(noop) {
    'use strict';

    var EmptyCollector = {
        init: noop,

        step: noop,

        result: noop
    };

    return EmptyCollector;
});
