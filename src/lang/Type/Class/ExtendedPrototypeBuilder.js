JARS.module('lang.Type.Class.ExtendedPrototypeBuilder').$import(['.PrototypeBuilder', '..Method.Class::overrideAll', 'lang.Function.Advice::around', {
    'lang.Object.Extend': ['::extend', '::merge']
}]).$export(function(PrototypeBuilder, overrideAll, around, extend, merge) {
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
            return overrideAll(extend(hiddenProto, this._builder.getHidden(Class, accessIdentifier, accessIdentifierAlias), hiddenSuperproto), hiddenSuperproto);
        },

        getPublic: around(function(Class, Superclass) {
            return overrideAll(merge(new Superclass(), Class.prototype, this._builder.getPublic(Class)), Superclass.prototype);
        }, function(Class, Superclass) {
            currentlyExtending = Superclass;
        }, function() {
            currentlyExtending = null;
        })
    };

    return ExtendedPrototypeBuilder;
});
