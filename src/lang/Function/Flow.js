JARS.module('lang.Function.Flow').$import([{
    '.': ['::enhance', '::from', '::apply', '::getArity']
}, 'System::env', '..Array::from']).$export(function(enhance, fromFunction, applyFunction, getArity, env, fromArgs) {
    'use strict';

    var global = env.global,
        defaultRegulatorOptions = {
            leading: true,

            trailing: true
        };

    /**
     *
     * @param {Function} fn
     * @param {Number} msClosed
     * @param {Object} options
     * @param {Boolean} resetOnCall
     *
     * @return {Function}
     */
    function createRegulatorFunction(fn, msClosed, options, resetOnCall) {
        var closed = false,
            lastArgs, timeoutID, context;

        if (!(options.leading || options.trailing)) {
            options = defaultRegulatorOptions;
        }

        function open() {
            closed = false;

            if (lastArgs && options.trailing) {
                applyFunction(fn, context, lastArgs);
                context = lastArgs = null;
            }
        }

        return fromFunction(function regulatorFn() {
            context = this;
            timeoutID = closed;

            if (resetOnCall || !closed) {
                closed = global.setTimeout(open, msClosed);
            }

            if (timeoutID || !options.leading) {
                resetOnCall && global.clearTimeout(timeoutID);
                lastArgs = arguments;
            }
            else {
                applyFunction(fn, context, arguments);
            }
        }, getArity(fn));
    }

    return enhance({
        debounce: function(ms, immediate) {
            return createRegulatorFunction(this, ms, {
                leading: immediate,

                trailing: !immediate
            }, true);
        },

        throttle: function(ms, options) {
            return createRegulatorFunction(this, ms, options || defaultRegulatorOptions);
        },

        delay: function(ms) {
            var fn = this;

            return fromFunction(function delayedFn() {
                var context = this,
                    args = fromArgs(arguments);

                global.setTimeout(function() {
                    applyFunction(fn, context, args);
                }, ms);
            });
        }
    });
});
