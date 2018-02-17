JARS.module('lang.Array.Find').$import(['System::isNumber', '.::enhance', {
    lang: ['Type.Method.Array::withCallback', 'transcollectors.Result', 'transducers::filter', {
        'Function': ['Modargs::partial', 'Advice::before', 'Guards::once'],
        'operations.Comparison': ['::lte', '::gte']
    }],
    '.Index': ['::getAbsolute', '::getStart']
}]).$export(function(isNumber, enhance, withCallback, ResultCollector, filter, partial, before, once, lte, gte, getAbsoluteIndex, getStartIndex) {
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
        return filter(before(function() {
            return (isReversed ? lte : gte)(data.extraInput, data.startIndex);
        }, once(function() {
            data.startIndex = getStartIndexOrDefault(data.subject, data.extraArg, isReversed);
        })));
    }

    function getStartIndexOrDefault(arr, startIndex, isReversed) {
        return isNumber(startIndex) ? getAbsoluteIndex(arr, startIndex) : getStartIndex(arr, isReversed);
    }

    return enhance({
        find: withCallback('find', transduceOptions),

        findLast: withCallback('findLast', reversedTransduceOptions),

        findIndex: withCallback('findIndex', transduceOptions),

        findLastIndex: withCallback('findLastIndex', reversedTransduceOptions)
    });
});
