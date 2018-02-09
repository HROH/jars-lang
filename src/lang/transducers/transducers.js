JARS.module('lang.transducers').$import({
    System: ['::isArrayLike', '::isObject'],
    '.': ['transformer.*', 'transcollectors.*', 'Array.Reduce::reduce', 'Object.Reduce::reduce']
}).$export(function(isArrayLike, isObject, transformer, transcollectors, arrayReduce, objectReduce) {
    'use strict';

    var transducers = {
        transduce: function(transducer, iter, acc, coll) {
            var transform = transducer(wrapTransform(iter));

            return transform.result(getReducer(coll)(coll, collectInput(coll, function(result, input) {
                return transform.step(result, input);
            }), acc));
        },

        into: function(transducer, collector, coll) {
            return transducers.transduce(transducer, collector.step, collector.init(), coll);
        },

        intoArray: function(transducer, coll) {
            return transducers.into(transducer, transcollectors.Array, coll);
        },

        intoObject: function(transducer, coll) {
            return transducers.into(transducer, transcollectors.Object, coll);
        },

        every: function(predicate) {
            return function(transform) {
                return new transformer.Every(predicate, transform);
            };
        },

        filter: function(predicate) {
            return function(transform) {
                return new transformer.Filter(predicate, transform);
            };
        },

        find: function(predicate) {
            return function(transform) {
                return new transformer.Find(predicate, transform);
            };
        },

        findIndex: function(predicate) {
            return function(transform) {
                return new transformer.FindIndex(predicate, transform);
            };
        },

        findLast: function(predicate) {
            return function(transform) {
                return new transformer.FindLast(predicate, transform);
            };
        },

        findLastIndex: function(predicate) {
            return function(transform) {
                return new transformer.FindLastIndex(predicate, transform);
            };
        },

        forEach: function(callback) {
            return function(transform) {
                return new transformer.ForEach(callback, transform);
            };
        },

        map: function(mapFn) {
            return function(transform) {
                return new transformer.Map(mapFn, transform);
            };
        },

        some: function(predicate) {
            return function(transform) {
                return new transformer.Some(predicate, transform);
            };
        }
    };

    transducers.each = transducers.forEach;

    function getReducer(coll) {
        return isArrayLike(coll) ? arrayReduce : isObject(coll) ? objectReduce : function(coll, fn, acc) {
            return acc;
        };
    }

    function collectInput(coll, fn) {
        return isObject(coll) ? function(result, value, key) {
            return fn(result, [key, value]);
        } : fn;
    }

    function wrapTransform(iter) {
        return {
            init: function() {},

            step: iter,

            result: function(acc) {
                return acc;
            }
        };
    }

    return transducers;
});
