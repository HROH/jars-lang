JARS.module('lang.Function.Combined').$import(['.::enhance', '.::from', '.::apply', {
    '..Array': ['::fromArguments', 'Reduce::reduce']
}, 'System::isFunction']).$export(function(enhance, fromFunction, applyFunction, fromArgs, reduce, isFunction) {
    'use strict';

    /**
     *
     * @param {Function} fn
     * @param {Arguments} functions
     * @param {Boolean} reversed
     *
     * @return {Function}
     */
    function createFunctionCombiner(fn, functions, reversed) {
        functions.unshift(fn);

        reversed && (functions = functions.reverse());

        return functions.length === 1 ? fn : fromFunction(function combinedFn(result) {
            return reduce(functions, callNextWithResult, result);
        }, fn.arity || fn.length);
    }

    function callNextWithResult(result, next) {
        return isFunction(next) ? next(result) : result;
    }

    return enhance({
        compose: function() {
            return createFunctionCombiner(this, fromArgs(arguments), true);
        },

        pipeline: function() {
            return createFunctionCombiner(this, fromArgs(arguments));
        },

        wrap: function(wrapperFn) {
            var fn = this,
                context;

            function next() {
                var result = applyFunction(fn, context, arguments);

                context = null;

                return result;
            }

            return fromFunction(function wrappedFn() {
                context = this;

                return applyFunction(wrapperFn, context, [next, arguments]);
            }, wrapperFn.arity || wrapperFn.length);
        }
    });
});
