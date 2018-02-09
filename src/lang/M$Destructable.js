JARS.module('lang.M$Destructable').$import('.Mixin').$export(function(Mixin) {
    'use strict';

    var M$Destructable = new Mixin('Destructable', {
        destruct: function() {
            this.Class.destructInstance(this);
        }
    });

    return M$Destructable;
});
