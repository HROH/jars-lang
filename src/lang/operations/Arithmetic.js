JARS.module('lang.operations.Arithmetic').$import(['.::createOperation', '..Object!Iterate', '..Enum']).$export(function(createOperation, Obj, Enum) {
    'use strict';

    var Arithmetic = {
        operators: new Enum({
            add: '+',

            subtract: '-',

            multiplyWith: '*',

            divideBy: '/',

            modulo: '%'
        })
    };

    Obj.each(Arithmetic.operators.values(), defineArithmeticOperation);

    function defineArithmeticOperation(arithmeticOperator, arithmeticOperationName) {
        Arithmetic[arithmeticOperationName] = Arithmetic[arithmeticOperator] = createOperation(arithmeticOperator);
    }

    return Arithmetic;
});
