JARS.module('lang.Type.Class.PrototypeBuilder').$import(['System::isFunction', {
    'lang.Type.Method.Instance': ['::privileged', '::privilegedWithClass'],
    'lang.Object': ['::hasOwn', 'Iterate::each', 'Extend::extend', {
        Derive: ['::map', '::filter']
    }]
}]).$export(function(isFunction, privileged, privilegedWithClass, hasOwn, each, extend, map, filter) {
    'use strict';

    function PrototypeBuilder(prototype) {
        this._proto = prototype || {};
    }

    PrototypeBuilder.prototype = {
        constructor: PrototypeBuilder,

        getHidden: function(Class, accessIdentifier, accessIdentifierAlias) {
            var proto = this._proto,
                hiddenProto = {
                    $proxy: privilegedWithClass(Class)
                };

            if (hasOwn(proto, accessIdentifier) || hasOwn(proto, accessIdentifierAlias)) {
                each(proto[accessIdentifier] || proto[accessIdentifierAlias], function addHiddenProperty(value, property) {
                    hiddenProto[accessIdentifier + property] = value;
                });

                delete proto[accessIdentifier];
                delete proto[accessIdentifierAlias];
            }

            return hiddenProto;
        },

        getPublic: function(Class) {
            var proto = this._proto;

            if(hasOwn(proto, '$')) {
                extend(proto, map(filter(proto.$, isFunction), function(method) {
                    return privileged(Class, method);
                }));

                delete proto.$;
            }

            return proto;
        }
    };

    return PrototypeBuilder;
});
