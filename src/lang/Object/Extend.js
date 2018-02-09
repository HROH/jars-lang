JARS.module('lang.Object.Extend').$import(['.::enhance', '.::hasOwn', {
    System: ['::isBoolean', '::isObject', '::isNil'],
    '..Array': ['.', '::fromArguments']
}]).$export(function(enhance, hasOwn, isBoolean, isObject, isNil, Arr, fromArgs) {
    'use strict';


    var Obj = this,
        mergeLevel = 0,
        mergedObjects = Arr(),
        Extend;

    Extend = enhance({
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

            return Extend.merge.apply(Extend, args);
        },

        merge: function() {
            var args = fromArgs(arguments),
                destObject = this,
                deep, keepDefault;

            while (isNil(keepDefault) && isDeepOrKeepDefault(args[args.length - 1])) {
                keepDefault = deep;
                deep = args.pop() || false;
            }

            args.each(function(mergeObject) {
                var prop;

                mergeLevel++;
                mergedObjects.push([mergeObject, destObject]);

                for (prop in mergeObject) {
                    hasOwn(mergeObject, prop) && merge(destObject, mergeObject, prop, deep, keepDefault);
                }

                --mergeLevel || (mergedObjects = Arr());
            });

            return destObject;
        }
    });

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
        return getAlreadyMergedValue(valueToMerge) || Extend.merge(isObject(oldValue) ? oldValue : {}, valueToMerge, true, keepDefault);
    }

    function getAlreadyMergedValue(valueToMerge) {
        return (mergedObjects.find(function(mergedObjectData) {
            return mergedObjectData[0] === valueToMerge;
        }, valueToMerge) || [])[1];
    }

    return Extend;
});
