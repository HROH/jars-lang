JARS.module('lang.Function', ['Advice', 'Combined', 'Flow', 'Guards', 'Modargs']).$import([{
    System: ['::isA', '::isFunction']
}, '.Array::fromArguments', '.Type!Function']).$export(function(isA, isFunction, fromArgs, Fn) {
    'use strict';

    var fnConverter = this.sandbox('__SYSTEM__').add('function(f, a){function fn(){return f.apply(this,arguments)};fn.arity=a||f.arity||f.length;return fn;}'),
        applyFunction;

    Fn.enhance({
        bind: function(context) {
            var fnToBind = this,
                FnLink = function() {},
                boundArgs = fromArgs(arguments).slice(1),
                returnFn = fromFunction(function boundFn() {
                    return applyFunction(fnToBind, (isA(this, FnLink) && context) ? this : context, boundArgs.concat(fromArgs(arguments)));
                }, fnToBind.arity || fnToBind.length);

            FnLink.prototype = fnToBind.prototype;
            returnFn.prototype = new FnLink();

            return returnFn;
        },

        negate: function() {
            var fn = this;

            return fromFunction(function() {
                return !applyFunction(fn, this, arguments);
            }, fn.arity || fn.length);
        },
        /**
         * Repeat the given function n times
         * The last parameter refers to the current execution time
         *
         * lang.Function.from(function(time) {
         *	System.Logger.log(time + ' time(s) executed');
         * }).repeat(5);
         *
         * outputs:
         *
         * '1 time(s) executed'
         * '2 time(s) executed'
         * '3 time(s) executed'
         * '4 time(s) executed'
         * '5 time(s) executed'
         */
        repeat: function(times) {
            var args = fromArgs(arguments).slice(1),
                results = Arr(),
                idx = 0;

            for (; idx < times;) {
                results[idx] = applyFunction(this, null, args.concat(++idx));
            }

            return results;
        },

        attempt: function() {
            var result = {};

            try {
                result.value = applyFunction(this, null, arguments);
            }
            catch(error) {
                result.error = isA(error, Error) ? error : new Error(error);
            }

            return result;
        },

        call: true,

        apply: true
    }, {
        from: fromFunction,

        fromNative: fromFunction,

        noop: function() {},

        identity: function(value) {
            return value;
        }
    });

    applyFunction = Fn.apply;

    /**
     *
     * @param {Function} fn
     *
     * @return {Function}
     */
    function fromFunction(fn, arity) {
        return (isA(fn, Fn) || !isFunction(fn)) ? fn : fnConverter(fn, arity);
    }

    return Fn;
});
