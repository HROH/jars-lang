JARS.module('lang.operations.Arithmetic').$import(['.::createOperation', '..Object.Iterate::each']).$export(function(createOperation, each) {
    'use strict';

    var Arithmetic = {
        operators: {
            add: '+',

            subtract: '-',

            multiplyWith: '*',

            divideBy: '/',

            modulo: '%'
        }
    };

    each(Arithmetic.operators, function(arithmeticOperator, arithmeticOperationName) {
        Arithmetic[arithmeticOperationName] = Arithmetic[arithmeticOperator] = createOperation(arithmeticOperator);
    });

    return Arithmetic;
});
