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
        var regulator = new Regulator(options.leading || options.trailing ? options : defaultRegulatorOptions, resetOnCall, msClosed);

        return fromFunction(function regulatorFn() {
            regulator.resetOrApply(fn, this, arguments);
        }, getArity(fn));
    }

    function Regulator(options, resetOnCall, msClosed) {
        this._closed = false;
        this._last = null;
        this._options = options;
        this._reset = resetOnCall;
        this._msClosed = msClosed;
    }

    Regulator.prototype = {
        constructor: Regulator,

        open: function() {
            var regulator = this,
                lastCall = regulator._last;

            regulator._closed = false;

            if (lastCall && regulator._options.trailing) {
                applyFunction(lastCall[0], lastCall[1], lastCall[2]);
                regulator._last = null;
            }
        },

        resetOrApply: function(fn, context, args) {
            var regulator = this,
                timeoutID = regulator._closed;

            regulator._close();

            if(timeoutID || !regulator._options.leading) {
                regulator._reset && global.clearTimeout(timeoutID);
                regulator._last = [fn, context, args];
            }
            else {
                applyFunction(fn, context, args);
            }
        },

        _close: function() {
            var regulator = this;

            if (regulator._reset || !regulator._closed) {
                regulator._closed = global.setTimeout(function() {
                    regulator.open();
                }, regulator._msClosed);
            }
        }
    };

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
