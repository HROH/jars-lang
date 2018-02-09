JARS.module('lang.transformer.FindIndex').$export(function() {
    'use strict';

    function FindIndex(predicate, transform) {
        this._transform = transform;
        this._predicate = predicate;
        this._index = 0;
        this._found = false;
    }

    FindIndex.prototype = {
        constructor: FindIndex,

        init: function() {
            return this._transform.init();
        },

        step: function(result, input) {
            if(!this._found && this._predicate(input)) {
                this._found = true;
                result = this._transform.step(result, this._index);
            }

            this._index++;

            return result;
        },

        result: function(result) {
            return this._transform.result(this._found ? result : this._transform.step(result, -1));
        }
    };

    return FindIndex;
});
