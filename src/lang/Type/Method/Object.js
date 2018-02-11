JARS.module('lang.Type.Method.Object').$import(['.::withAssert', {
    '.Transduced': ['::withCallback', '::withTransducer'],
    lang: [{
        Function: ['::noop', 'Combined::compose', 'Modargs::partial']
    }, 'transducers::map', 'transcollectors.Object']
}]).$export(function(withAssert, withCallback, withTransducer, noop, compose, partial, map, ObjectCollector) {
    'use strict';

    var ObjectMethod = {
        withCallback: function(methodName, transduceOptions) {
            return withCallback('Object', methodName, getTransduceOptions(transduceOptions || {}));
        },

        withTransducer: partial(withTransducer, 'Object'),

        withAssert: partial(withAssert, 'Object')
    };

    function getTransduceOptions(transduceOptions) {
        return {
            pre: function(data) {
                return compose(preExtractKey(data), (transduceOptions.pre || noop)(data));
            },

            post: postAddKey,

            collector: transduceOptions.collector || ObjectCollector
        };
    }

    function preExtractKey(data) {
        return map(function(input) {
            data.extraInput = input[0];

            return input[1];
        });
    }

    function postAddKey(data) {
        return map(function(input) {
            return [data.extraInput, input];
        });
    }

    return ObjectMethod;
});
