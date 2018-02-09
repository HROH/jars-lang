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
                return value === searchElement.valueOf(); // use valueOf() to compare numbers correctly
            }, null, fromIndex);
        });
    }

    return Search;
});
