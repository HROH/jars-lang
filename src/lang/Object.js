JARS.module('lang.Object', ['Derive', 'Extend', 'Info', 'Iterate', 'Manipulate', 'Reduce']).$import(['*!Helpers/Object', {
    System: ['::isA', '::isObject']
}, '.Type!Object']).$export(function(ObjectHelper, isA, isObject, Obj) {
    'use strict';

    var merge = ObjectHelper.merge;

    /**
     * Extend lang.Object with some useful methods
     */
    Obj.enhance({
        hasOwn: Object.prototype.hasOwnProperty
    }, {
        from: fromObject,

        fromNative: fromObject
    });

    function fromObject(object) {
        return (isA(object, Obj) || !isObject(object)) ? object : merge(Obj(), object);
    }

    return Obj;
});
