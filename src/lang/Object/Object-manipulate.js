JARS.module('lang.Object.Object-manipulate').$import([
    '.!derive,iterate',
    '..Array!reduce'
]).$export(function(Obj, Arr) {
    'use strict';

    Obj.enhance({
        update: function(callback, context) {
            Obj.each(this, function updateProperty(value, property, object) {
                object[property] = callback.call(context, value, property, object);
            });
        },

        remove: function(keys) {
            return Arr.reduce(keys, removeProperty, this);
        }
    });

    function removeProperty(object, key) {
        delete object[key];

        return object;
    }

    return Obj.extract(Obj, ['update', 'remove']);
});
