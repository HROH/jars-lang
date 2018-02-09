JARS.module('lang.transformer.ForEach').$export(function() {
    'use strict';

    function ForEach(callback, transform) {
        this._transform = transform;
        this._callback = callback;
    }

    ForEach.prototype = {
        constructor: ForEach,

        init: function() {
            return this._transform.init();
        },

        step: function(result, input) {
            this._callback(input);

            return this._transform.step(input);
        },

        result: function(result) {
            return this._transform.result(result);
        }
    };

    return ForEach;
});
