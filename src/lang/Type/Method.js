JARS.module('lang.Type.Method', ['Array', 'Class', 'Instance', 'Object', 'Transduced']).$import(['..Function.Advice::before', {
    '..assert': ['::isNotNil', 'Type::isFunction']
}]).$export(function(before, assertIsNotNil, assertIsFunction) {
    'use strict';

    var MSG_NO_CALLBACK = 'The callback is not a function',
        Method;

    Method = {
        withAssert: function(typeName, methodName, method) {
            return before(method, createAssert(typeName, methodName));
        },

        withCallbackAssert: function(method) {
            return before(method, callbackAssert);
        }
    };

    function createAssert(typeName, methodName) {
        var assertionMessage = typeName + '.prototype.' + methodName + ' called on null or undefined';

        return function() {
            assertIsNotNil(this, assertionMessage);
        };
    }

    function callbackAssert(callback) {
        assertIsFunction(callback, MSG_NO_CALLBACK);
    }

    return Method;
});
