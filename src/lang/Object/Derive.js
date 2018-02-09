JARS.module('lang.Object.Derive').$import(['.::enhance', '.Info::prop', '..transcollectors.Object', {
    '..transducers': ['::transduce', '::intoObject', '::map'],
    'lang.Type.Method.Object': ['::withCallback', '::withTransducer', '::withAssert']
}]).$export(function(enhance, prop, ObjectCollector, transduce, intoObject, map, withCallback, withTransducer, withAssert) {
    'use strict';

    return enhance({
        /**
         * @param {Array} keys
         *
         * @return {Object}
         */
        extract: withAssert('extract', function(keys) {
            var object = this;

            return intoObject(map(function(key) {
                return [key, prop(object, key)];
            }), keys);
        }),
        /**
         * @param {Function} callback
         * @param {*} context
         *
         * @return {Object}
         */
        filter: withCallback('filter'),
        /**
         * @param {Function} callback
         * @param {*} context
         *
         * @return {Object}
         */
        map: withCallback('map'),
        /**
         * @return {Object}
         */
        invert: withTransducer('invert', ObjectCollector, map(function(input) {
            return input.reverse();
        }))
    });
});
