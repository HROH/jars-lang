JARS.module('lang.operations.Comparison').$import(['.::createOperation', '..Object.Iterate::each']).$export(function(createOperation, each) {
    'use strict';

    /**
     * @namespace Comparison
     *
     * @memberof lang.operations
     */
    var Comparison = {
        operators: {
            Equal: {
                op: '==',

                alias: 'eq'
            },

            StrictEqual: {
                op: '===',

                alias: 'seq'
            },

            LowerThan: {
                op: '<',

                alias: 'lt'
            },

            LowerThanOrEqual: {
                op: '<=',

                alias: 'lte'
            },

            GreaterThan: {
                op: '>',

                alias: 'gt'
            },

            GreaterThanOrEqual: {
                op: '>=',

                alias: 'gte'
            }
        }
    };

    each(Comparison.operators, function(comparator, comparisonName) {
        var operator = comparator.op,
            alias = comparator.alias,
            negatedOperator = '!' + (operator.indexOf('=') === 0 ? operator.substring(1) : operator);

        Comparison['is' + comparisonName] = Comparison[alias] = Comparison[operator] = createOperation(operator);
        Comparison['isNot' + comparisonName] = Comparison['n' + alias] = Comparison[negatedOperator] = createOperation(operator, true);
    });

    /**
     * @method isEqual
     * @alias eq
     *
     * @memberof lang.operations.Comparison
     *
     * @param {*} value
     * @param {*} compareValue
     *
     * @return {Boolean}
     */

    /**
     * @method isNotEqual
     * @alias neq
     *
     * @memberof lang.operations.Comparison
     *
     * @param {*} value
     * @param {*} compareValue
     *
     * @return {Boolean}
     */

    /**
     * @method isStrictEqual
     * @alias seq
     *
     * @memberof lang.operations.Comparison
     *
     * @param {*} value
     * @param {*} compareValue
     *
     * @return {Boolean}
     */

    /**
     * @method isNotStrictEqual
     * @alias nseq
     *
     * @memberof lang.operations.Comparison
     *
     * @param {*} value
     * @param {*} compareValue
     *
     * @return {Boolean}
     */

    /**
     * @method isLowerThan
     * @alias lt
     *
     * @memberof lang.operations.Comparison
     *
     * @param {*} value
     * @param {*} compareValue
     *
     * @return {Boolean}
     */

    /**
     * @method isNotLowerThan
     * @alias nlt
     *
     * @memberof lang.operations.Comparison
     *
     * @param {*} value
     * @param {*} compareValue
     *
     * @return {Boolean}
     */

    /**
     * @method isLowerThanOrEqual
     * @alias lte
     *
     * @memberof lang.operations.Comparison
     *
     * @param {*} value
     * @param {*} compareValue
     *
     * @return {Boolean}
     */

    /**
     * @method isNotLowerThanOrEqual
     * @alias nlte
     *
     * @memberof lang.operations.Comparison
     *
     * @param {*} value
     * @param {*} compareValue
     *
     * @return {Boolean}
     */

    /**
     * @method isGreaterThan
     * @alias gt
     *
     * @memberof lang.operations.Comparison
     *
     * @param {*} value
     * @param {*} compareValue
     *
     * @return {Boolean}
     */

    /**
     * @method isNotGreaterThan
     * @alias ngt
     *
     * @memberof lang.operations.Comparison
     *
     * @param {*} value
     * @param {*} compareValue
     *
     * @return {Boolean}
     */

    /**
     * @method isGreaterThanOrEqual
     * @alias gte
     *
     * @memberof lang.operations.Comparison
     *
     * @param {*} value
     * @param {*} compareValue
     *
     * @return {Boolean}
     */

    /**
     * @method isNotGreaterThanOrQual
     * @alias ngte
     *
     * @memberof lang.operations.Comparison
     *
     * @param {*} value
     * @param {*} compareValue
     *
     * @return {Boolean}
     */

    return Comparison;
});
