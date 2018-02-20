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
                handleThrow = options && options.handleThrow;

            return fromFunction(function around() {
                var context = this,
                    result;

                executeBefore && applyFunction(executeBefore, context, arguments);
                result = (handleThrow ? attempt : applyFunction)(fn, context, arguments);
                executeAfterwards && applyFunction(executeAfterwards, context, arguments);

                if(handleThrow && result.error) {
                    throw result.error;
                }

                return handleThrow ? result.value : result;
            }, getArity(fn));
        }
    });

    return Advice;
});
