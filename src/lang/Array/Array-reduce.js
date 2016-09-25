JARS.module('lang.Array.Array-reduce').$import({
    '..assert': [
        '.',
        '::isNotNil',
        'Type::isFunction'
    ]
}).$export(function(assert, assertIsNotNil, assertIsFunction) {
    'use strict';

    var Arr = this,
        MSG_NO_FUNCTION = 'The callback is not a function',
        MSG_REDUCE_OF_EMPTY_ARRAY = 'Reduce of empty array with no initial value';

    Arr.enhance({
        reduce: createReduce(),

        reduceRight: createReduce(true)
    });

    function createReduce(reduceRight) {
        var assertionMessage = 'Array.prototype.reduce' + (reduceRight ? 'Right' : '') + ' called on null or undefined';

        return function(callback, initialValue) {
            var arr = this,
                len = arr.length >>> 0,
                isValueSet = false,
                idx = reduceRight ? len - 1 : 0,
                ret;

            assertIsNotNil(arr, assertionMessage);

            assertIsFunction(callback, MSG_NO_FUNCTION);

            if (arguments.length > 1) {
                ret = initialValue;
                isValueSet = true;
            }

            for (; reduceRight ? idx >= 0 : idx < len; reduceRight ? --idx : ++idx) {
                if (idx in arr) {
                    if (isValueSet) {
                        ret = callback(ret, arr[idx], idx, arr);
                    }
                    else {
                        ret = arr[idx];
                        isValueSet = true;
                    }
                }
            }

            assert(isValueSet, MSG_REDUCE_OF_EMPTY_ARRAY);

            return ret;
        };
    }

    return {
        reduce: Arr.reduce,

        reduceRight: Arr.reduceRight
    };
});
