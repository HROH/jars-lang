JARS.module('lang.Type.Method.Transduced').$import(['.::withAssert', '.::withCallbackAssert', {
    lang: ['transducers', 'Function.Combined::compose']
}]).$export(function(withAssert, withCallbackAssert, transducers, compose) {
    'use strict';

    var Transduced = {
        withCallback: function(typeName, methodName, transduceOptions) {
            return withAssert(typeName, methodName, withCallbackAssert(function(callback, context, extraArg) {
                var data = {
                        subject: this,

                        extraArg: extraArg
                    },
                    transducer = compose(transduceOptions.pre(data), transducers[methodName](prepareCallback(callback, context, data)), transduceOptions.post(data));

                return transducers.into(transducer, transduceOptions.collector, this);
            }));
        },

        withTransducer: function(typeName, methodName, collector, transducer) {
            return withAssert(typeName, methodName, function() {
                return transducers.into(transducer, collector, this);
            });
        }
    };

    function prepareCallback(callback, context, data) {
        return function(input) {
            return callback.call(context, input, data.extraInput, data.subject, data.extraArg);
        };
    }

    return Transduced;
});
