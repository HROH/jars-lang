JARS.module('lang.Type.Class.PrototypeBuilder').$import(['System::isFunction', {
    'lang.Type.Method.Instance': ['::privileged', '::privilegedWithClass'],
    'lang.Object': ['::hasOwn', 'Iterate::each', 'Extend::extend', {
        Derive: ['::map', '::filter']
    }]
}]).$export(function(isFunction, privileged, privilegedWithClass, hasOwn, each, extend, map, filter) {
    'use strict';

    var PRIVILEGED_IDENTIFIER = '$',
        PRIVILEGED_IDENTIFIER_ALIAS = 'privileged';

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

            if (hasProto(proto, accessIdentifier, accessIdentifierAlias)) {
                each(getProto(proto, accessIdentifier, accessIdentifierAlias), function addHiddenProperty(value, property) {
                    hiddenProto[accessIdentifier + property] = value;
                });

                removeProto(proto, accessIdentifier, accessIdentifierAlias);
            }

            return hiddenProto;
        },

        getPublic: function(Class) {
            var proto = this._proto;

            if(hasProto(proto, PRIVILEGED_IDENTIFIER, PRIVILEGED_IDENTIFIER_ALIAS)) {
                extend(proto, map(filter(getProto(proto, PRIVILEGED_IDENTIFIER, PRIVILEGED_IDENTIFIER_ALIAS), isFunction), function(method) {
                    return privileged(Class, method);
                }));

                removeProto(proto, PRIVILEGED_IDENTIFIER, PRIVILEGED_IDENTIFIER_ALIAS);
            }

            return proto;
        }
    };

    function getProto(proto, id, alias) {
        return proto[id] || proto[alias];
    }

    function hasProto(proto, id, alias) {
        return hasOwn(proto, id) || hasOwn(proto, alias);
    }

    function removeProto(proto, id, alias) {
        delete proto[id];
        delete proto[alias];
    }

    return PrototypeBuilder;
});
