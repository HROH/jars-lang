JARS.module('lang.Object.Reduce').$import(['.::enhance', '.::hasOwn', '..assert']).$export(function(enhance, hasOwn, assert) {
    'use strict';

    var MSG_REDUCE_OF_EMPTY_OBJECT = 'Reduce of empty object with no initial value';

    return enhance({
        reduce: function(callback, initialValue) {
            var object = this,
                isValueSet = arguments.length > 1,
                result = initialValue,
                key;

            for (key in object) {
                if (hasOwn(object, key)) {
                    result = isValueSet ? callback(result, object[key], key, object) : object[key];
                    isValueSet = true;
                }
            }

            assert(isValueSet, MSG_REDUCE_OF_EMPTY_OBJECT);

            return result;
        }
    });
});
