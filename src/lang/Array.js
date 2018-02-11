JARS.module('lang.Array', ['Check', 'Derive', 'Find', 'Item', 'Iterate', 'Manipulate', 'Reduce', 'Search']).$import([{
    '.assert': ['::isNotNil', 'Type::isFunction']
}, '.Type!Array']).$export(function(assertIsNotNil, assertIsFunction, Arr) {
    'use strict';

    var MSG_REQUIRES_ARRAYLIKE = 'Array.from requires an array-like object - not null or undefined',
        MSG_NO_FUNCTION = 'Array.from: when provided, the second argument must be a function';

    /**
     * @class Array
     *
     * @memberof module:lang
     *
     * @alias module:Array
     */

    Arr.enhance({
        concat: true,

        join: true,

        pop: true,

        push: true,

        reverse: true,

        shift: true,

        slice: true,

        sort: true,

        splice: true,

        unshift: true
    }, {
        from: fromArray,

        fromNative: fromArray,

        fromArguments: fromArray,

        fromArrayLike: fromArray
    });

    function fromArray(arrayLike, mapFn, context) {
        var index = 0,
            newArray, len;

        assertIsNotNil(arrayLike, MSG_REQUIRES_ARRAYLIKE);

        mapFn && assertIsFunction(mapFn, MSG_NO_FUNCTION);

        len = arrayLike.length >>> 0;

        newArray = Arr(len);

        while (index < len) {
            newArray[index] = mapFn ? mapFn.call(context, arrayLike[index], index) : arrayLike[index];

            index++;
        }

        return newArray;
    }

    return Arr;
});
