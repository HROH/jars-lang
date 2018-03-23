JARS.module('lang.Array.Check').$import(['.::enhance', {
    lang: ['Type.Method.Array::withCallback', 'transcollectors.Result', {
        'Function.Modargs': ['::PLACEHOLDER', '::partial']
    }]
}]).$export(function(enhance, withCallback, Result, PLACEHOLDER, partial) {
    'use strict';

    var createCheck = partial(withCallback, PLACEHOLDER, {
        collector: Result
    });

    return enhance({
        every: createCheck('every'),

        some: createCheck('some')
    });
});
