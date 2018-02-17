JARS.module('lang.Array.Item').$import(['.::enhance', '.::slice', '.Index::getAbsolute']).$export(function(enhance, slice, getAbsoluteIndex) {
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
            return this[getAbsoluteIndex(this, index)];
        }
    });

    return Item;
});
