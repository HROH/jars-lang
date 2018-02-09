JARS.module('lang.Array.Iterate').$import(['.::enhance', '..transcollectors.Empty', 'lang.Type.Method.Array::withCallback', {
    'lang.Function.Modargs': ['::PLACEHOLDER', '::partial']
}]).$export(function(enhance, Empty, withCallback, PLACEHOLDER, partial) {
    'use strict';

    var createLoop = partial(withCallback, PLACEHOLDER, {
            collector: Empty
        });

    return enhance({
        each: createLoop('each'),

        forEach: createLoop('forEach')
    });
});
