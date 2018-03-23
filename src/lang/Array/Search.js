JARS.module('lang.Array.Search').$import(['.::enhance', {
    '.Find': ['::findIndex', '::findLastIndex']
}, 'lang.Type.Method.Array::withAssert']).$export(function(enhance, findIndex, findLastIndex, withAssert) {
    'use strict';

    var Search = enhance({
        contains: withAssert('contains', function(searchElement, fromIndex) {
            return Search.indexOf(this, searchElement, fromIndex) !== -1;
        }),

        indexOf: createIndexOf('indexOf', findIndex),

        lastIndexOf: createIndexOf('lastIndexOf', findLastIndex)
    });

    function createIndexOf(methodName, findMethod) {
        return withAssert(methodName, function(searchElement, fromIndex) {
            return findMethod(this, function(value) {
                // use valueOf() to compare numbers correctly
                return value === searchElement.valueOf();
            }, null, fromIndex);
        });
    }

    return Search;
});
