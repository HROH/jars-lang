JARS.module('lang.Function.Advice').$import(['.::apply', '.::from', '.::enhance']).$export(function(applyFunction, fromFunction, enhance) {
    'use strict';

    var Advice = enhance({
        after: function(executeAfterwards) {
            return Advice.around(this, null, executeAfterwards);
        },

        before: function(executeBefore) {
            return Advice.around(this, executeBefore, null);
        },

        around: function(executeBefore, executeAfterwards) {
            var fn = this;

            return fromFunction(function adviceFn() {
                var context = this,
                    result;

                executeBefore && applyFunction(executeBefore, context, arguments);
                result = applyFunction(fn, context, arguments);
                executeAfterwards && applyFunction(executeAfterwards, context, arguments);

                return result;
            }, fn.arity || fn.length);
        }
    });

    return Advice;
});
