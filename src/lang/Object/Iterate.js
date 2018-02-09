JARS.module('lang.Object.Iterate').$import(['.::enhance', '.::hasOwn', {
    'lang.Type.Method': ['Object::withAssert', '::withCallbackAssert']
}]).$export(function(enhance, hasOwn, withAssert, withCallbackAssert) {
    'use strict';

    var forOwn = createForIn(true),
        forInherited = createForIn();

    function createForIn(skipNotOwn) {
        return withCallbackAssert(function(callback, context) {
            var object = this,
                prop;

            for (prop in object) {
                if (!skipNotOwn || hasOwn(object, prop)) {
                    callback.call(context, object[prop], prop, object);
                }
            }
        });
    }

    return enhance({
        each: withAssert('each', forOwn),

        forEach: withAssert('forEach', forOwn),

        eachInherited: withAssert('eachInherited', forInherited),

        forEachInherited: withAssert('forEachInherited', forInherited)
    });
});
