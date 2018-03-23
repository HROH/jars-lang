JARS.module('lang.Interface').$import(['.ObjectInterface', '.Array.Derive::filter', {
    '.Class': ['.', '::isClass', '::isInstance']
}]).$export(function(ObjectInterface, filter, Class, isClass, isInstance) {
    'use strict';

    var MSG_IMPLEMENTOR_TYPE_MISMATCH = 'You must provide a class or instance to check',
        MSG_INTERFACE_MISSING = 'There is no interface given to compare with!',
        Interface;

    Interface = Class('Interface', {
        construct: function(interfaceName, methods) {
            this.$super(interfaceName, methods);
        },

        _$: {
            hasImplementor: function(implementor) {
                var hasImplementor = this.$super(implementor);

                if(hasImplementor) {
                    hasImplementor = isClass(implementor) ? !!implementor.prototype : isInstance(implementor) ? !!implementor : null;

                    if(!hasImplementor) {
                        this._$logger.warn(MSG_IMPLEMENTOR_TYPE_MISMATCH);
                    }
                }

                return hasImplementor;
            },

            findNotImplemented: function(implementor) {
                return this.$super(isClass(implementor) ? implementor.prototype : implementor);
            },

            logNotImplemented: function(implementor, notImplementedMethods) {
                this.$super(isClass(implementor) || isInstance(implementor) ? implementor.getHash() : implementor, notImplementedMethods);
            }
        }
    }).extendz(ObjectInterface);

    /**
     * Checks whether any method of InterFace.methods is defined in the Class
     * Returns the Class if all methods exist false otherwise
     *
     * @param Object... iface
     *
     * @return Object
     */
    Class.addStaticMethod('implementz', function() {
        var isImplemented = false,
            currentClass = this,
            interfaces = filter(arguments, Interface.isInstance, Interface);

        if (interfaces.length) {
            isImplemented = Interface.isImplementedBy(interfaces, currentClass);
        }
        else {
            currentClass.logger.warn(MSG_INTERFACE_MISSING);
        }

        return isImplemented && currentClass;
    });

    return Interface;
});
