JARS.module('lang.Object', ['Derive', 'Info', 'Iterate', 'Manipulate', 'Reduce']).$import([{
    System: ['::isA', '::isBoolean', '::isObject', '::isNil'],
    '.Array': ['::from', '!Find,Iterate']
}, '.!']).$export(function(isA, isBoolean, isObject, isNil, fromArgs, Arr) {
    'use strict';

    var lang = this,
        mergeLevel = 0,
        mergedObjects = Arr(),
        Obj = lang.sandboxNativeType('Object'),
        hasOwn;

    /**
     * Extend lang.Object with some useful methods
     */
    Obj.enhance({
        /**
         * @param {Boolean} deep
         *
         * @return {Object}
         */
        copy: function(deep) {
            return (new Obj()).extend(this, deep);
        },

        extend: function() {
            var args = fromArgs(arguments),
                argsLen = args.length;

            isDeepOrKeepDefault(args[argsLen - 1]) || (args[argsLen++] = false);

            args[argsLen] = true;
            args.unshift(this);

            return Obj.merge.apply(Obj, args);
        },

        merge: function() {
            var args = fromArgs(arguments),
                object = this,
                deep, keepDefault;

            while (isNil(keepDefault) && isDeepOrKeepDefault(args[args.length - 1])) {
                keepDefault = deep;
                deep = args.pop() || false;
            }

            args.each(function(mergeObject) {
                var prop;

                mergeLevel++;
                mergedObjects.push([mergeObject, object]);

                for (prop in mergeObject) {
                    hasOwn(mergeObject, prop) && merge(object, mergeObject, prop, deep, keepDefault);
                }

                --mergeLevel || (mergedObjects = Arr());
            });

            return object;
        },

        hasOwn: Object.prototype.hasOwnProperty
    }, {
        from: fromObject,

        fromNative: fromObject
    });

    hasOwn = Obj.hasOwn;

    function fromObject(object, deep) {
        return (isA(object, Obj) || !isObject(object)) ? object : Obj.copy(object, deep);
    }

    function isDeepOrKeepDefault(value) {
        return isBoolean(value) || isNil(value);
    }

    function merge(obj, mergeObj, prop, deep, keepDefault) {
        var hasOld = hasOwn(obj, prop);

        obj[prop] = calculateNewValue(hasOld ? obj[prop] : null, mergeObj[prop], deep, hasOld ? keepDefault : false);
    }

    function calculateNewValue(oldValue, valueToMerge, deep, keepDefault) {
        return shouldMergeDeep(oldValue, valueToMerge, deep, keepDefault) ? mergeDeep(oldValue, valueToMerge, keepDefault) : keepDefault ? oldValue : valueToMerge;
    }

    function shouldMergeDeep(oldValue, valueToMerge, deep, keepDefault) {
        return deep && (!keepDefault || isObject(oldValue)) && isObject(valueToMerge);
    }

    function mergeDeep(oldValue, valueToMerge, keepDefault) {
        return getAlreadyMergedValue(valueToMerge) || Obj.merge(isObject(oldValue) ? oldValue : {}, valueToMerge, true, keepDefault);
    }

    function getAlreadyMergedValue(valueToMerge) {
        return (mergedObjects.find(function(mergedObjectData) {
            return mergedObjectData[0] === valueToMerge;
        }, valueToMerge) || [])[1];
    }

    return Obj;
});
