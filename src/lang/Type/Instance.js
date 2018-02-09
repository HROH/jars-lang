JARS.module('lang.Type.Instance').$import(['lang::generateHash', 'lang.Array.Iterate::each', {
    '.Class': ['::exists', '::is', '::onAdded', '::onRemoved', '::getPrototypesOf'],
    'lang.Object': ['::hasOwn', 'Extend::extend', 'Manipulate::update']
}]).$export(function(generateHash, arrayEach, existsClass, isClass, onClassAdded, onClassRemoved, getPrototypesOf, hasOwn, extend, update) {
    'use strict';

    var Classes = {},
        addListeners = [],
        removeListeners = [],
        PROTECTED_IDENTIFIER = '_$',
        //PRIVATE_IDENTIFIER = '_',
        Instance;

    Instance = {
        add: function(instance) {
            var Class = instance.Class,
                instanceHashPrefix = 'Object #<' + Class.getModuleName() + ':' + Class.getClassName() + '#',
                instances = Classes[Class.getHash()],
                instanceHash;

            do {
                instanceHash = instanceHashPrefix + generateHash('xx-x-x-x-xxx') + '>';
            }
            while (hasOwn(instances, instanceHash));

            // !!!IMPORTANT: never delete or override this method!!!
            instance.getHash = function() {
                return instanceHash;
            };

            instances[instanceHash] = extend({
                instance: instance,

                $isElevated: false
            }, getPrototypesOf(Class));

            arrayEach(addListeners, function(listener) {
                listener(instance);
            });

            return instance;
        },

        remove: function(instance) {
            arrayEach(removeListeners, function(listener) {
                listener(instance);
            });

            delete Classes[instance.Class.getHash()][instance.getHash()];
        },

        onAdded: function(listener) {
            addListeners.push(listener);
        },

        onRemoved: function(listener) {
            removeListeners.push(listener);
        },

        exists: function(instance) {
            return existsClass(instance.Class) && hasOwn(Classes[instance.Class.getHash()], instance.getHash());
        },

        is: function(instance) {
            return instance && isClass(instance.Class) && instance.Class.isInstance(instance);
        },

        isElevated: function(instance) {
            return getHiddenInstance(instance).$isElevated;
        },

        elevate: function(instance) {
            var hiddenInstance = getHiddenInstance(instance);

            if(!hiddenInstance.$isElevated) {
                extend(instance, hiddenInstance[PROTECTED_IDENTIFIER]);
                hiddenInstance.$isElevated = true;
            }
        },

        commit: function(instance) {
            var hiddenInstance = getHiddenInstance(instance);

            if(hiddenInstance.$isElevated) {
                update(hiddenInstance[PROTECTED_IDENTIFIER], function(value, property) {
                    var newValue = instance[property];

                    delete instance[property];

                    return newValue;
                });

                hiddenInstance.$isElevated = false;
            }
        }
    };

    function getHiddenInstance(instance) {
        return Classes[instance.Class.getHash()][instance.getHash()];
    }

    onClassAdded(function(Class) {
        Classes[Class.getHash()] = {};
    });

    onClassRemoved(function(Class) {
        delete Classes[Class.getHash()];
    });

    return Instance;
});
