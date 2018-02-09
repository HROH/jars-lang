JARS.module('lang.Array.Manipulate').$import(['System::isArrayLike', '.::enhance', '.Iterate::forEach', {
    '.Search': ['::contains', '::indexOf'],
    '..Function': ['::negate', 'Modargs::partial'],
    '..transducers': ['::transduce', '::filter']
}, '..transcollectors.Array']).$export(function(isArrayLike, enhance, forEach, contains, indexOf, negate, partial, transduce, filter, ArrayCollector) {
    'use strict';

    return enhance({
        merge: function(array) {
            if (isArrayLike(array)) {
                this.push.apply(this, array);
            }

            return this;
        },

        mergeUnique: function(sourceArray) {
            var destArray = this;

            return transduce(filter(negate(partial(contains, destArray))), ArrayCollector.step, destArray, sourceArray);
        },

        removeAll: function(array) {
            var arr = this;

            forEach(array, function(item) {
                var index;

                while ((index = indexOf(arr, item)) != -1) {
                    arr.splice(index, 1);
                }
            });

            return this;
        }
    });
});
