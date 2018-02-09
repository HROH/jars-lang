JARS.module('lang.Type.Method.Class').$import(['System::isFunction', {
    lang: [{
        Function: ['::apply', 'Advice::around']
    }, 'Array.Search::contains', 'Object.Iterate::each']
}]).$export(function(isFunction, applyFunction, around, contains, each) {
    'use strict';

    var excludeOverride = ['Class', 'constructor', 'getHash', '$proxy'],
        ClassMethod;

    ClassMethod = {
        overrideAll: function(proto, superProto) {
            each(proto, function(method, methodName) {
                // Never override Class()-, constructor()-, $proxy()- and getHash()-methods
                if (isFunction(method) && !contains(excludeOverride, methodName) && isFunction(superProto[methodName]) && superProto[methodName] !== method) {
                    proto[methodName] = override(method, function $super() {
                        return applyFunction(superProto[methodName], this, arguments);
                    });
                }
            });
        }
    };
    
    /**
     * @param {function} method
     * @param {function} superMethod
     */
    function override(method, superMethod) {
        var currentSuper;

        return around(method, function beforeMethodCall() {
            currentSuper = this.$super;

            // create a new temporary this.$super that uses the method of the Superclass.prototype
            this.$super = superMethod;
        }, function afterMethodCall() {
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
