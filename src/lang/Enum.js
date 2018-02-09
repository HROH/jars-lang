JARS.module('lang.Enum').$import([{
    System: ['::isArray', '::isObject'],
    '.Object': ['::hasOwn', 'Extend::copy', 'Iterate::each']
}, '.Array.Reduce::reduce', '.Class']).$export(function(isArray, isObject, hasOwn, copy, each, reduce, Class) {
    'use strict';

    var BASE_TWO = 2,
        Enum;

    Enum = Class('Enum', {
        $: {
            construct: function(enums, options) {
                options = options || {};

                if (isArray(enums)) {
                    enums = reduce(enums, function aggregateEnums(enumsObject, key, index) {
                        enumsObject[key] = options.bitSteps ? Math.pow(BASE_TWO, index) : options.mirror ? key : index;

                        return enumsObject;
                    }, {});
                }

                if (isObject(enums)) {
                    each(enums, addKeyToEnum, this);

                    this._$enums = enums;
                }
            },

            values: function() {
                return copy(this._$enums);
            },

            contains: function(key) {
                return hasOwn(this._$enums, key);
            }
        },

        _$: {
            enums: null
        }
    });

    function addKeyToEnum(value, key) {
        /*jslint validthis: true */
        this[key] = value;
    }

    return Enum;
});
