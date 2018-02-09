JARS.module('lang.operations.Logical').$import(['.::createOperation', '.::operands', '..Object.Iterate::each']).$export(function(createOperation, operands, each) {
    'use strict';

    var Logical = {
        operators: {
            and: '&&',

            or: '||'
        }
    };

    each(Logical.operators, function(logicalOperator, methodName) {
        Logical[methodName] = Logical[logicalOperator] = createOperation(logicalOperator);
        Logical['n' + methodName] = Logical['!' + logicalOperator] = createOperation(logicalOperator, true);
    });

    Logical.xor = createOperation('?!' + operands.SECOND + ':!!');

    return Logical;
});
