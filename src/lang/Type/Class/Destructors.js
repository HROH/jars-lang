JARS.module('lang.Type.Class.Destructors').$import(['System::isFunction', '.::enhance', '.::remove', '.::onAdded', '.::onRemoved', '..Method.Instance::privileged', 'lang.Object::hasOwn', {
    'lang.Array': ['Iterate::each', 'Manipulate::mergeUnique'],
    '..Instance': ['::remove', '::onAdded', '::onRemoved']
}]).$export(function(isFunction, enhance, removeClass, onClassAdded, onClassRemoved, privileged, hasOwn, each, mergeUnique, removeInstance, onInstanceAdded, onInstanceRemoved) {
    'use strict';

    var Classes = {},
        MSG_ALREADY_DESTRUCTED = '"${instance}" is already destructed',
        Destructors;

    Destructors = {
        add: function(Class, destructor, instance) {
            return Class.addDestructor(destructor, instance);
        },

        destruct: function(Class, instance) {
            return Class.destructInstance(instance);
        },

        destructClass: function(Class) {
            Class.destruct();
        }
    };

    enhance({
        /**
         * @param {function():void} destructor
         * @param {Object} instance
         *
         * @return {Class}
         */
        addDestructor: function(destructor, instance) {
            var Class = this;

            if (isFunction(destructor)) {
                (Class.isInstance(instance) ? getInstanceDestructors(Class, instance) : getClassDestructors(Class)).push(privileged(Class, destructor));
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
                destructors = getInstanceDestructors(Class, instance);

            if (Class.isInstance(instance) && destructors) {
                do {
                    mergeUnique(destructors, getClassDestructors(Class));
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

            each(Class.getSubclasses(), function destructSubclass(Subclass) {
                Subclass.destruct();
            });

            removeClass(Class);
        }
    });

    function getClassDestructors(Class) {
        return Classes[Class.getHash()].destructors;
    }

    function getInstanceDestructors(Class, instance) {
        return Classes[Class.getHash()].instanceDestructors[instance.getHash()];
    }

    onClassAdded(function(Class) {
        Classes[Class.getHash()] = {
            destructors: [],

            instanceDestructors: {}
        };
    });

    onClassRemoved(function(Class) {
        delete Classes[Class.getHash()];
    });

    onInstanceAdded(function(instance) {
        Classes[instance.Class.getHash()].instanceDestructors[instance.getHash()] = [];
    });

    onInstanceRemoved(function(instance) {
        delete Classes[instance.Class.getHash()].instanceDestructors[instance.getHash()];
    });

    return Destructors;
});
