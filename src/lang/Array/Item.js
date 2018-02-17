JARS.module('lang.Array.Item').$import(['.::enhance', '.::slice']).$export(function(enhance, slice) {
    'use strict';

    var Item = enhance({
        head: function() {
            return Item.nth(this, 0);
        },

        tail: function() {
            return slice(this, 1);
        },

        init: function() {
            return slice(this, 0, -1);
        },

        last: function() {
            return Item.nth(this, -1);
        },

        nth: function(index) {
            return this[index < 0 ? this.length + index : index];
        }
    });

    return Item;
});
