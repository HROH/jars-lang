JARS.module('lang.Array.Manipulate').$import(['System::isArrayLike', '.::enhance', '.Iterate::forEach', {
    '.Search': ['::contains', '::indexOf'],
    '..Function': ['::negate', 'Modargs::partial'],
    '..transducers': ['::transduce', '::filter']
}, '..transcollectors.Array']).$export(function(isArrayLike, enhance, forEach, contains, indexOf, negate, partial, transduce, filter, ArrayCollector) {
    'use strict';

    return enhance({
        merge: function(array) {
            isArrayLike(array) && this.push.apply(this, array);

            return this;
        },

        mergeUnique: function(sourceArray) {
           return transduce(filter(negate(partial(contains, this))), ArrayCollector.step, this, sourceArray);
        },

        removeAll: function(array) {
            var arr = this;

            forEach(array, function(item) {
                while (contains(arr, item)) {
                    arr.splice(indexOf(arr, item), 1);
                }
            });

            return this;
        }
    });
});
