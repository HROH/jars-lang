JARS.module('lang.Class', ['Abstract', 'Final', 'Singleton']).$import(['.Object.Extend::extend', {
    '.Type': ['Instance::is', 'Method.Instance::privilegedWithModule', {
        Class: ['::enhance', '::add', '::is', 'PrototypeBuilder', 'Inheritance::isExtendableWhen', 'Instance::isNewableWhen', 'Destructors::destruct', 'Pool']
    }]
}]).$export(function(extend, isInstance, privilegedWithModule, enhance, addClass, isClass, PrototypeBuilder, isExtendableWhen, isNewableWhen, destruct) {
    'use strict';

    enhance({
        /**
         * @param {string} name
         * @param {Object} proto
         * @param {Object} staticProperties
         *
         * @return {MetaClass}
         */
        createSubclass: function(name, proto, staticProperties) {
            return ClassFactory(name, proto, staticProperties).extendz(this);
        }
    });

    /**
     * @method Class
     *
     * @memberof lang
     *
     * @alias module:Class
     *
     * @param {string} name
     * @param {Object<string, *>} proto
     * @param {Object<string, *>} staticProperties
     *
     * @return {MetaClass}
     */
    function ClassFactory(name, proto, staticProperties) {
        return addClass(name, new PrototypeBuilder(proto), staticProperties);
    }

    /**
     * @borrows lang.Type.Class.enhance as lang.Class.addStaticMethods
     * @borrows lang.Type.Class.get as lang.Class.getClass
     * @borrows lang.Type.Class.getAll as lang.Class.getClasses
     * @borrows lang.Type.Class.is as lang.Class.isClass
     * @borrows lang.Type.Instance.is as lang.Class.isInstance
     * @borrows lang.Type.Class.Destructors.destruct as lang.Class.destruct
     * @borrows lang.Type.Class.Instance.isNewableWhen as lang.Class.isNewableWhen
     * @borrows lang.Type.Class.Inheritance.isExtendableWhen as lang.Class.isExtendableWhen
     * @borrows lang.Type.Method.Instance.privilegedWithModule as lang.Class.privilegedWithModule
     */
    extend(ClassFactory, {
        addStaticMethods: enhance,
        /**
         * @method lang.Class.addStaticMethod
         *
         * @param {string} methodName
         * @param {function} method
         */
        addStaticMethod: function(methodName, method) {
            var methods = {};

            methods[methodName] = method;

            enhance(methods);
        },

        isClass: isClass,

        isInstance: isInstance,

        destruct: destruct,

        isNewableWhen: isNewableWhen,

        isExtendableWhen: isExtendableWhen,

        privilegedWithModule: privilegedWithModule
    });

    return ClassFactory;
});
