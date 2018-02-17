JARS.module('lang.Array.Reduce').$import(['.::enhance', '..assert', {
    '.Index': ['::getStart', '::isNotLimit'],
    'lang.Type.Method': ['::withAssert', '::withCallbackAssert']
}]).$export(function(enhance, assert, getStartIndex, isNotLimit, withAssert, withCallbackAssert) {
    'use strict';

    var MSG_REDUCE_OF_EMPTY_ARRAY = 'Reduce of empty array with no initial value';

    function createReduce(reduceRight) {
        return withAssert('Array', reduceRight ? 'reduceRight' : 'reduce', withCallbackAssert(function(callback, initialValue) {
            var arr = this,
                isValueSet = arguments.length > 1,
                index = getStartIndex(arr, reduceRight),
                result = initialValue;

            while(isNotLimit(arr, index, reduceRight)) {
                if (index in arr) {
                    result = isValueSet ? callback(result, arr[index], index, arr) : arr[index];
                    isValueSet = true;
                }

                reduceRight ? --index : ++index;
            }

            assert(isValueSet, MSG_REDUCE_OF_EMPTY_ARRAY);

            return result;
        }));
    }

    return enhance({
        reduce: createReduce(),

        reduceRight: createReduce(true)
    });
});
