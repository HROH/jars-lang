JARS.module('lang.transformer.Map').$export(function() {
    'use strict';

    function Map(mapFn, transform) {
        this._transform = transform;
        this._mapFn = mapFn;
    }

    Map.prototype = {
        constructor: Map,

        init: function() {
            return this._transform.init();
        },

        step: function(result, input) {
            return this._transform.step(result, this._mapFn(input));
        },

        result: function(result) {
            return this._transform.result(result);
        }
    };

    return Map;
});
