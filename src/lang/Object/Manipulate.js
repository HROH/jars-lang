JARS.module('lang.Object.Manipulate').$import(['.::enhance', '.Iterate::each', '..Array.Reduce::reduce']).$export(function(enhance, each, reduce) {
    'use strict';

    function removeProperty(object, key) {
        delete object[key];

        return object;
    }

    return enhance({
        update: function(callback, context) {
            each(this, function(value, property, object) {
                object[property] = callback.call(context, value, property, object);
            });

            return this;
        },

        remove: function(keys) {
            return reduce(keys, removeProperty, this);
        }
    });
});
