JARS.module('lang.Array.Item').$import('.::enhance').$export(function(enhance) {
    'use strict';

    return enhance({
        head: function() {
            return this[0];
        },

        tail: function() {
            return this[this.length - 1];
        },

        nth: function(index) {
            return this[index];
        }
    });
});
