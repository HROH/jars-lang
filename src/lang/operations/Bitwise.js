JARS.module('lang.operations.Bitwise').$import(['.::createOperation', '..Object!Iterate']).$export(function(createOperation, each) {
    'use strict';

    var Bitwise = {
        operators: {
            and: '&',

            or: '|',

            xor: '^',

            leftShift: '<<',

            rightShiftDrop: '>>',

            rightShiftFill: '>>>'
        }
    };

    each(Bitwise.operators, function(bitwiseOperator, methodName) {
        Bitwise[bitwiseOperator] = Bitwise[methodName] = createOperation(bitwiseOperator);
    });

    return Bitwise;
});
