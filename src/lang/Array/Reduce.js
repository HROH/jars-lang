JARS.module('lang.Array.Reduce').$import(['.::enhance', '..assert', {
    'lang.Type.Method': ['::withAssert', '::withCallbackAssert']
}]).$export(function(enhance, assert, withAssert, withCallbackAssert) {
    'use strict';

    var MSG_REDUCE_OF_EMPTY_ARRAY = 'Reduce of empty array with no initial value';

    function createReduce(reduceRight) {
        return withAssert('Array', reduceRight ? 'reduceRight' : 'reduce', withCallbackAssert(function(callback, initialValue) {
            var arr = this,
                length = arr.length >>> 0,
                isValueSet = arguments.length > 1,
                index = getStartIndex(reduceRight, length),
                result = initialValue;

            while(canContinue(reduceRight, index, length)) {
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

    function getStartIndex(reduceRight, length) {
        return reduceRight ? length - 1 : 0;
    }

    function canContinue(reduceRight, index, length) {
        return reduceRight ? index >= 0 : index < length;
    }

    return enhance({
        reduce: createReduce(),

        reduceRight: createReduce(true)
    });
});
