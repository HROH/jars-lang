JARS.module('lang.Object.Info').$import(['.::enhance', '.::hasOwn', '.Reduce::reduce', {
    'lang.Array': ['::from', 'Reduce::reduce', {
        Item: ['::head', '::tail']
    }],
    'lang.Function.Modargs': ['::PLACEHOLDER', '::partial'],
    'lang.Type.Method.Object': ['::withAssert', '::withTransducer'],
    lang: ['transcollectors.Array', 'transducers::map', 'operations.Arithmetic::add']
}]).$export(function(enhance, hasOwn, objectReduce, fromArray, arrayReduce, head, tail, PLACEHOLDER, partial, withAssert, withTransducer, ArrayCollector, map, add) {
    'use strict';

    var withTransducerToArray = partial(withTransducer, PLACEHOLDER, ArrayCollector),
        countProperties = add(1);

    return enhance({
        keys: withTransducerToArray('keys', map(head)),

        pairs: withTransducerToArray('pairs', map(fromArray)),

        prop: withAssert('prop', function(key) {
            return arrayReduce(key.split('.'), function(obj, key) {
                return (obj && hasOwn(obj, key)) ? obj[key] : undefined;
            }, this);
        }),

        size: withAssert('size', function() {
            return objectReduce(this, countProperties, 0);
        }),

        values: withTransducerToArray('values', map(tail))
    });
});
