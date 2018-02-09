JARS.module('lang.Object', ['Derive', 'Extend', 'Info', 'Iterate', 'Manipulate', 'Reduce']).$import([{
    System: ['::isA', '::isObject']
}, '.Type!Object']).$export(function(isA, isObject, Obj) {
    'use strict';

    /**
     * Extend lang.Object with some useful methods
     */
    Obj.enhance({
        hasOwn: Object.prototype.hasOwnProperty
    }, {
        from: fromObject,

        fromNative: fromObject
    });

    // TODO Obj.copy not available
    function fromObject(object, deep) {
        return (isA(object, Obj) || !isObject(object)) ? object : Obj.copy(object, deep);
    }

    return Obj;
});
