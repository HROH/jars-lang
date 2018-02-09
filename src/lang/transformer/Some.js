JARS.module('lang.transformer.Some').$export(function() {
    'use strict';

    function Some(predicate, transform) {
        this._transform = transform;
        this._predicate = predicate;
        this._check = false;
    }

    Some.prototype = {
        constructor: Some,

        init: function() {
            return this._transform.init();
        },

        step: function(result, input) {
            if(!this._check && this._predicate(input)) {
                this._check = true;
            }

            return result;
        },

        result: function(result) {
            return this._transform.result(this._transform.step(result, this._check));
        }
    };

    return Some;
});
