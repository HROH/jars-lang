JARS.module('lang.Function.Guards').$import(['.::enhance', '.::from', '.::apply']).$export(function(enhance, fromFunction, applyFunction) {
    'use strict';

    var Guards = enhance({
        memoize: function(serializer) {
            var fn = this,
                cache = {};

            return fromFunction(function memoizedFn() {
                var hash = (serializer || internalSerializer)(arguments);

                return hash in cache ? cache[hash] : (cache[hash] = applyFunction(fn, this, arguments));
            });
        },

        once: function() {
            return Guards.callN(this, 1);
        },

        callN: function(count) {
            return createGuardedFunction(this, count, false);
        },

        blockN: function(count) {
            return createGuardedFunction(this, count, true);
        }
    });

    function createGuardedFunction(fn, count, guardBefore) {
        var called = 0;

        count = Math.round(Math.abs(count)) || 0;

        return fromFunction(function guardedFn() {
            var unguarded = guardBefore ? called >= count : called < count;

            unguarded !== guardBefore && called++;

            return unguarded ? applyFunction(fn, this, arguments) : undefined;
        });
    }

    /**
     * TODO better implementation
     *
     * @param {Arguments} args
     *
     * @return {String}
     */
    function internalSerializer(args) {
        return JSON.stringify(args[0]);
    }

    return Guards;
});
