JARS.module('lang.Type.Method.Object').$import(['.::withAssert', {
    '.Transduced': ['::withCallback', '::withTransducer'],
    lang: [{
        Function: ['::noop', 'Combined::compose', 'Modargs::partial']
    }, 'transducers::map', 'transcollectors.Object']
}]).$export(function(withAssert, withCallback, withTransducer, noop, compose, partial, map, ObjectCollector) {
    'use strict';

    var ObjectMethod = {
        withCallback: function(methodName, transduceOptions) {
            transduceOptions = transduceOptions || {};

            return withCallback('Object', methodName, {
                pre: function(data) {
                    return compose(createKeyExtractor(data), (transduceOptions.pre || noop)(data));
                },

                post: postAddKey,

                collector: transduceOptions.collector || ObjectCollector
            });
        },

        withTransducer: partial(withTransducer, 'Object'),

        withAssert: partial(withAssert, 'Object')
    };

    function createKeyExtractor(data) {
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
