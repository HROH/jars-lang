JARS.module('lang.Object.Info').$import(['.::enhance', '.::hasOwn', '.Reduce::reduce', {
    'lang.Array': ['::from', 'Reduce::reduce'],
    'lang.Function.Modargs': ['::PLACEHOLDER', '::partial'],
    'lang.Type.Method.Object': ['::withAssert', '::withTransducer'],
    lang: ['transcollectors.Array', 'transducers::map']
}]).$export(function(enhance, hasOwn, objectReduce, fromArray, arrayReduce, PLACEHOLDER, partial, withAssert, withTransducer, ArrayCollector, map) {
    'use strict';

    var withTransducerToArray = partial(withTransducer, PLACEHOLDER, ArrayCollector);

    function countProperties(size) {
        return ++size;
    }

    return enhance({
        keys: withTransducerToArray('keys', map(function(pair) {
            return pair[0];
        })),

        pairs: withTransducerToArray('pairs', map(fromArray)),

        prop: withAssert('prop', function(key) {
            return arrayReduce(key.split('.'), function(obj, key) {
                return (obj && hasOwn(obj, key)) ? obj[key] : undefined;
            }, this);
        }),

        size: withAssert('size', function() {
            return objectReduce(this, countProperties, 0);
        }),

        values: withTransducerToArray('values', map(function(pair) {
            return pair[1];
        }))
    });
});
