JARS.module('lang.Function.Modargs').$import(['.::enhance', '.::from', '.::apply', '.::getArity', {
    '..Array': ['::from', '::reverse'],
    '..transducers': ['::intoArray', '::map']
}]).$export(function(enhance, fromFunction, applyFunction, getArity, fromArgs, reverseArray, intoArray, map) {
    'use strict';

    var Modargs = enhance({
        flip: function() {
            var fn = this;

            return fromFunction(function flippedFn() {
                return applyFunction(fn, this, reverseArray(arguments));
            }, getArity(fn));
        },

        functional: function(arity) {
            return Modargs.curry(Modargs.flip(this), arity);
        },

        curry: function(arity) {
            var fn = this;

            arity = arity || getArity(fn);

            return fromFunction(arity < 2 ? fn : function curryFn() {
                var args = fromArgs(arguments);

                return args.length >= arity ? applyFunction(fn, this, args) : fromFunction(function curriedFn() {
                    return applyFunction(curryFn, this, args.concat(fromArgs(arguments)));
                }, arity - args.length);
            }, arity);
        },

        partial: createArgumentsReplacer(true),
        /**
         * Store the arguments in placeholderArgs
         * They will be used in the call to func as default if no other arguments are available
         *
         * Example:
         *
         * function(a) {
         *	return a || value;
         * }
         *
         * This would be equal to:
         *
         * lang.Function.from(function(a) {
         *	return a;
         * }).defaults(value);
         *
         */
        defaults: createArgumentsReplacer()
    }, {
        PLACEHOLDER: new PlaceholderArg()
    });

    function PlaceholderArg() {}

    /**
     *
     * @param {Function} fn
     * @param {Arguments} args
     * @param {Function} mapFn
     *
     * @return {Function}
     */
    function createArgumentsReplacer(isPartial) {
        return function() {
            var fn = this,
                args = fromArgs(arguments);

            return fromFunction(function mappedFn() {
                var replaceArgs = isPartial ? fromArgs(arguments) : args.slice();

                return applyFunction(fn, this, intoArray(replacePlaceholders(replaceArgs), isPartial ? args : fromArgs(arguments)).concat(replaceArgs));
            }, getArity(fn));
        };
    }

    function replacePlaceholders(replaceArgs) {
        return map(function(defaultArg) {
            return defaultArg === Modargs.PLACEHOLDER ? replaceArgs.shift() : defaultArg;
        });
    }

    return Modargs;
});
