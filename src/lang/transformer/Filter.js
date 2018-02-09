JARS.module('lang.transformer.Filter').$export(function() {
    'use strict';

    function Filter(predicate, transform) {
        this._transform = transform;
        this._predicate = predicate;
    }

    Filter.prototype = {
        constructor: Filter,

        init: function() {
            return this._transform.init();
        },

        step: function(result, input) {
            return this._predicate(input) ? this._transform.step(result, input) : result;
        },

        result: function(result) {
            return this._transform.result(result);
        }
    };

    return Filter;
});
