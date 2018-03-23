JARS.module('lang.Function.Advice').$import(['.::apply', '.::from', '.::enhance', '.::getArity', '.::attempt']).$export(function(applyFunction, fromFunction, enhance, getArity, attempt) {
    'use strict';

    var Advice = enhance({
        after: function(executeAfterwards, options) {
            return Advice.around(this, null, executeAfterwards, options);
        },

        before: function(executeBefore) {
            return Advice.around(this, executeBefore, null);
        },

        around: function(executeBefore, executeAfterwards, options) {
            var fn = this,
                handleThrow = options && options.handleThrow,
                apply = handleThrow ? attempt : applyFunction;

            return fromFunction(function around() {
                var context = this,
                    result;

                applyAdvice(executeBefore, context, arguments);
                result = apply(fn, context, arguments);
                applyAdvice(executeAfterwards, context, arguments);

                if(handleThrow && result.error) {
                    throw result.error;
                }

                return handleThrow ? result.value : result;
            }, getArity(fn));
        }
    });

    function applyAdvice(advice, context, args) {
        advice && applyFunction(advice, context, args);
    }

    return Advice;
});
