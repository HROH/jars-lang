JARS.module('lang.Type.Method.Class').$import(['System::isFunction', {
    lang: ['Function.Advice::around', 'Array.Search::contains', 'Object.Manipulate::update']
}]).$export(function(isFunction, around, contains, update) {
    'use strict';

    var excludeOverride = ['Class', 'constructor', 'getHash', '$proxy'],
        ClassMethod;

    ClassMethod = {
        overrideAll: function(proto, superProto) {
            return update(proto, function(method, methodName) {
                return canOverride(method, methodName, superProto) ? override(method, superProto[methodName]) : method;
            });
        }
    };

    // Never override Class()-, constructor()-, $proxy()- and getHash()-methods
    function canOverride(method, methodName, superProto) {
        return isFunction(method) && !contains(excludeOverride, methodName) && isFunction(superProto[methodName]) && superProto[methodName] !== method;
    }

    /**
     * @param {function} method
     * @param {function} superMethod
     */
    function override(method, superMethod) {
        var currentSuper;

        return around(method, function() {
            currentSuper = this.$super;

            // create a new temporary this.$super that uses the method of the Superclass.prototype
            this.$super = superMethod;
        }, function() {
            // restore or delete this.$super
            if (currentSuper) {
                this.$super = currentSuper;
                currentSuper = null;
            }
            else {
                delete this.$super;
            }
        });
    }

    return ClassMethod;
});
