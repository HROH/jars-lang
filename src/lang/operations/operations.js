JARS.module('lang.operations', ['Arithmetic', 'Comparison', 'Bitwise', 'Logical']).$import(['System.Formatter::format', '.assert']).$export(function(format, assert) {
    'use strict';

    var operands = {
            FIRST: 'a',

            SECOND: 'b'
        },
        operationBody = 'return arguments.length==2?${op}:(${SECOND}=${FIRST},function(${FIRST}){return ${op};})',
        operations;

    operations = {
        operands: operands,

        createOperation: function(operator, negate) {
            /*jslint evil: true */
            assert(operator.length <= 6, 'Operator is too long!');

            return new Function(operands.FIRST, operands.SECOND, format(operationBody, {
                op: [negate ? '!' : '', '(', operands.FIRST, operator, operands.SECOND, ')'].join(''),

                FIRST: operands.FIRST,

                SECOND: operands.SECOND
            }));
        }
    };

    return operations;
});
