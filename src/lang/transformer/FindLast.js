JARS.module('lang.transformer.FindLast').$export(function() {
    'use strict';

    function FindLast(predicate, transform) {
        this._transform = transform;
        this._predicate = predicate;
        this._lastFound = undefined;
    }

    FindLast.prototype = {
        constructor: FindLast,

        init: function() {
            return this._transform.init();
        },

        step: function(result, input) {
            if(this._predicate(input)) {
                this._lastFound = input;
            }

            return result;
        },

        result: function(result) {
            return this._transform.result(this._transform.step(result, this._lastFound));
        }
    };

    return FindLast;
});
