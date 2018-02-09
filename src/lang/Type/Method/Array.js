JARS.module('lang.Type.Method.Array').$import(['.::withAssert', {
    '.Transduced': ['::withCallback', '::withTransducer'],
    lang: [{
        Function: ['::noop', 'Combined::compose', 'Modargs::partial']
    }, 'transcollectors.Array', 'transducers::map']
}]).$export(function(withAssert, withCallback, withTransducer, noop, compose, partial, ArrayCollector, map) {
    'use strict';

    var ArrayMethod = {
        withCallback: function(methodName, transduceOptions) {
            return withCallback('Array', methodName, getTransduceOptions(transduceOptions || {}));
        },

        withTransducer: partial(withTransducer, 'Array'),

        withAssert: partial(withAssert, 'Array')
    };

    function getTransduceOptions(transduceOptions) {
        return {
            pre: function(data) {
                return compose(createIndexer(data), (transduceOptions.pre || noop)(data));
            },

            post: noop,

            collector: transduceOptions.collector || ArrayCollector
        };
    }

    function createIndexer(data) {
        var index = 0;

        return map(function(input) {
            data.extraInput = index++;

            return input;
        });
    }

    return ArrayMethod;
});
