JARS.module('lang.Type.Class.Destructors').$import(['System::isFunction', '.::enhance', '.::remove', '..ClassMap', {
    'lang.Array': ['Iterate::each', 'Manipulate::mergeUnique'],
    '..': ['Method.Instance::privileged', 'Instance::remove']
}]).$export(function(isFunction, enhance, removeClass, ClassMap, each, mergeUnique, privileged, removeInstance) {
    'use strict';

    var CLASS_DESTRUCTORS = 'destructors',
        classMap = ClassMap.withKey(CLASS_DESTRUCTORS, function() {
            return [];
        }, {
            onInstanceAdded: function() {
                return [];
            }
        }),
        MSG_ALREADY_DESTRUCTED = '"${instance}" is already destructed',
        Destructors;

    Destructors = enhance({
        /**
         * @param {function():void} destructor
         * @param {Object} instance
         *
         * @return {Class}
         */
        addDestructor: function(destructor, instance) {
            var Class = this;

            if (isFunction(destructor)) {
                (Class.isInstance(instance) ? classMap.getInstance(instance) : classMap.get(Class, CLASS_DESTRUCTORS)).push(privileged(Class, destructor));
            }

            return Class;
        },
        /**
         * @param {Object} instance
         *
         * @return {Class}
         */
        destructInstance: function(instance) {
            var Class = this,
                destructors = classMap.getInstance(instance);

            if (Class.isInstance(instance) && destructors) {
                do {
                    mergeUnique(destructors, classMap.get(Class, CLASS_DESTRUCTORS));
                    Class = Class.getSuperclass();
                } while (Class);

                while (destructors.length) {
                    destructors.shift().call(instance);
                }

                removeInstance(instance);
            }
            else if (instance.Class !== Class) {
                instance.Class.destructInstance(instance);
            }
            else {
                Class.logger.warn(MSG_ALREADY_DESTRUCTED, {
                    instance: instance.getHash()
                });
            }

            return Class;
        },

        destruct: function() {
            var Class = this;

            each(Class.getInstances(), Class.destructInstance, Class);

            each(Class.getSubclasses(), function(Subclass) {
                Subclass.destruct();
            });

            removeClass(Class);
        }
    });

    return Destructors;
});
