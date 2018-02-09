JARS.module('lang.Array.Find').$import(['System::isNumber', '.::enhance', {
    lang: ['Object::hasOwn', 'Type.Method.Array::withCallback', 'transcollectors.Result', 'transducers::filter', 'Function.Modargs::partial', {
        'operations.Comparison': ['::lte', '::gte']
    }]
}]).$export(function(isNumber, enhance, hasOwn, withCallback, ResultCollector, filter, partial, lte, gte) {
    'use strict';

    var transduceOptions = createTransduceOptions(),
        reversedTransduceOptions = createTransduceOptions(true);

    function createTransduceOptions(isReversed) {
        return {
            pre: partial(createFilter, isReversed),

            collector: ResultCollector
        };
    }

    function createFilter(isReversed, data) {
        return filter(function() {
            hasOwn(data, 'startIndex') || (data.startIndex = getStartIndex(isReversed, data.extraArg, data.subject.length));

            return (isReversed ? lte : gte)(data.extraInput, data.startIndex);
        });
    }

    function getStartIndex(isReversed, startIndex, length) {
        return isNumber(startIndex) ? getAbsoluteIndex(startIndex, length) : getDefaultIndex(isReversed, length);
    }

    function getAbsoluteIndex(index, length) {
        return gte(index, 0) ? index : length + index;
    }

    function getDefaultIndex(isReversed, length) {
        return isReversed ? length - 1 : 0;
    }

    return enhance({
        find: withCallback('find', transduceOptions),

        findLast: withCallback('findLast', reversedTransduceOptions),

        findIndex: withCallback('findIndex', transduceOptions),

        findLastIndex: withCallback('findLastIndex', reversedTransduceOptions)
    });
});
