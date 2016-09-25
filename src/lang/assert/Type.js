JARS.module('lang.assert.Type').$import('System').$export(function(System) {
    'use strict';

    var assert = this,
        types = 'Null Undefined String Number Boolean Array Arguments Object Function Date RegExp'.split(' '),
        typeCount = types.length - 1,
        Type = {},
        TYPE_ASSERTION_ERROR_MESSAGE = 'The given value is not of type ${type}';

    for (; typeCount > 0; typeCount--) {
        createTypeAssertion(types[typeCount]);
    }

    function createTypeAssertion(type) {
        var typeValidatorName = 'is' + type,
            typeLowerCase = type.toLowerCase();

        Type[typeValidatorName] = function(val, message) {
            assert(System[typeValidatorName](val), message || TYPE_ASSERTION_ERROR_MESSAGE.replace('${type}', typeLowerCase), {
                error: TypeError
            });
        };
    }

    return Type;
});
