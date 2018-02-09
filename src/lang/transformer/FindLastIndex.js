JARS.module('lang.transformer.FindLastIndex').$export(function() {
    'use strict';

    function FindLastIndex(predicate, transform) {
        this._transform = transform;
        this._predicate = predicate;
        this._index = 0;
        this._lastFound = -1;
    }

    FindLastIndex.prototype = {
        constructor: FindLastIndex,

        init: function() {
            return this._transform.init();
        },

        step: function(result, input) {
            if(this._predicate(input)) {
                this._lastFound = this._index;
            }

            this._index++;

            return result;
        },

        result: function(result) {
            return this._transform.result(this._transform.step(result, this._lastFound));
        }
    };

    return FindLastIndex;
});
