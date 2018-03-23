JARS.module('lang.Function', ['Advice', 'Combined', 'Flow', 'Guards', 'Modargs']).$import([{
    System: ['::isA', '::isFunction']
}, '.Array::fromArguments', '.Type!Function']).$export(function(isA, isFunction, fromArgs, Fn) {
    'use strict';

    var fnConverter = Fn('f', 'return function fn(){return f.apply(this,arguments)};'),
        applyFunction;

    Fn.enhance({
        bind: function(context) {
            var fnToBind = this,
                FnLink = function() {},
                boundArgs = fromArgs(arguments).slice(1),
                returnFn = fromFunction(function boundFn() {
                    return applyFunction(fnToBind, isA(this, FnLink) && context ? this : context, boundArgs.concat(fromArgs(arguments)));
                }, Fn.getArity(fnToBind));

            FnLink.prototype = fnToBind.prototype;
            returnFn.prototype = new FnLink();

            return returnFn;
        },

        getArity: function() {
            return this.arity || this.length || 0;
        },

        setArity: function(arity) {
            this.arity = arity;

            return this;
        },

        negate: function() {
            var fn = this;

            return fromFunction(function() {
                return !applyFunction(fn, this, arguments);
            }, Fn.getArity(fn));
        },
        /**
         * Repeat the given function n times
         * The last parameter refers to the current execution time
         *
         * lang.Function.from(function(time) {
         *     System.Logger.log(time + ' time(s) executed');
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
                results = [],
                idx = 0;

            for (; idx < times;) {
                results[idx] = applyFunction(this, null, args.concat(++idx));
            }

            return results;
        },

        attempt: function(context, args) {
            var result = {};

            try {
                result.value = applyFunction(this, context || null, args);
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
        return isA(fn, Fn) || !isFunction(fn) ? fn : Fn.setArity(fnConverter(fn), arguments.length > 1 ? arity : Fn.getArity(fn));
    }

    return Fn;
});
