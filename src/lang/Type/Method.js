JARS.module('lang.Type.Method', ['Array', 'Class', 'Instance', 'Object', 'Transduced']).$import(['System.Formatter::format', {
    '..Function': ['Advice::before', 'Modargs::partial', 'Modargs::PLACEHOLDER'],
    '..assert': ['::isNotNil', 'Type::isFunction']
}]).$export(function(format, before, partial, PLACEHOLDER, assertIsNotNil, assertIsFunction) {
    'use strict';

    var formatAssertionMessage = partial(format, '${0}.prototype.${1} called on null or undefined'),
        Method;

    Method = {
        withAssert: function(typeName, methodName, method) {
            return before(method, createAssert(typeName, methodName));
        },

        withCallbackAssert: partial(before, PLACEHOLDER, partial(assertIsFunction, PLACEHOLDER, 'The callback is not a function'))
    };

    function createAssert(typeName, methodName) {
        var assertionMessage = formatAssertionMessage([typeName, methodName]);

        return function() {
            assertIsNotNil(this, assertionMessage);
        };
    }

    return Method;
});
