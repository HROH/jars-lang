JARS.module('lang.M$Cloneable').$import('.Mixin').$export(function(Mixin) {
    'use strict';

    var M$Cloneable = new Mixin('Cloneable', {
        clone: function() {
            var clone = new this.Class();

            if (clone === this) {
                clone = null;
            }

            return clone;
        }
    });

    return M$Cloneable;
});
