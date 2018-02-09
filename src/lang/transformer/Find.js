JARS.module('lang.transformer.Find').$export(function() {
    'use strict';

    function Find(predicate, transform) {
        this._transform = transform;
        this._predicate = predicate;
        this._found = false;
    }

    Find.prototype = {
        constructor: Find,

        init: function() {
            return this._transform.init();
        },

        step: function(result, input) {
            if(!this._found && this._predicate(input)) {
                this._found = true;
                result = this._transform.step(result, input);
            }

            return result;
        },

        result: function(result) {
            return this._transform.result(this._found ? result : this._transform.step(result, undefined));
        }
    };

    return Find;
});
