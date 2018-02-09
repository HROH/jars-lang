JARS.module('lang.Type.Class.ExtendedPrototypeBuilder').$import(['.PrototypeBuilder', '..Method.Class::overrideAll', {
    'lang.Object.Extend': ['::extend', '::merge']
}]).$export(function(PrototypeBuilder, overrideAll, extend, merge) {
    'use strict';

    var currentlyExtending;

    function ExtendedPrototypeBuilder(prototype) {
        this._builder = new PrototypeBuilder(prototype);
    }

    ExtendedPrototypeBuilder.isExtending = function(Class) {
        return currentlyExtending === Class;
    };

    ExtendedPrototypeBuilder.prototype = {
        constructor: ExtendedPrototypeBuilder,

        getHidden: function(Class, accessIdentifier, accessIdentifierAlias, hiddenProto, hiddenSuperproto) {
            extend(hiddenProto, this._builder.getHidden(Class, accessIdentifier, accessIdentifierAlias), hiddenSuperproto);

            overrideAll(hiddenProto, hiddenSuperproto);

            return hiddenProto;
        },

        getPublic: function(Class, Superclass) {
            var proto;

            currentlyExtending = Superclass;
            proto = merge(new Superclass(), Class.prototype, this._builder.getPublic(Class));
            currentlyExtending = null;

            overrideAll(proto, Superclass.prototype);

            return proto;
        }
    };

    return ExtendedPrototypeBuilder;
});
