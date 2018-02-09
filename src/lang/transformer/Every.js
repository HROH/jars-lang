JARS.module('lang.transformer.Every').$export(function() {
    'use strict';

    function Every(predicate, transform) {
        this._transform = transform;
        this._predicate = predicate;
        this._check = true;
    }

    Every.prototype = {
        constructor: Every,

        init: function() {
            return this._transform.init();
        },

        step: function(result, input) {
            if(this._check && !this._predicate(input)) {
                this._check = false;
            }

            return result;
        },

        result: function(result) {
            return this._transform.result(this._transform.step(result, this._check));
        }
    };

    return Every;
});
