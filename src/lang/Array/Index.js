JARS.module('lang.Array.Index').$import(['.::enhance']).$export(function(enhance) {
    'use strict';

    var Index = enhance({
        getAbsolute: function(index) {
            return index >= 0 ? index : this.length + index;
        },

        getStart: function(isReversed) {
            return isReversed ? this.length - 1 : 0;
        },

        isNotLimit: function(index, isReversed) {
            return isReversed ? index >= 0 : index < this.length;
        }
    });

    return Index;
});
