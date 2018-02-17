JARS.module('lang.Type.Instance').$import(['lang::generateHash', '.ClassMap', {
    '.Class': ['::exists', '::is', '::getPrototypesOf'],
    'lang.Object': ['::hasOwn', 'Extend::extend', 'Manipulate::update']
}]).$export(function(generateHash, ClassMap, existsClass, isClass, getPrototypesOf, hasOwn, extend, update) {
    'use strict';

    var classMap = new ClassMap({
            onAdded: function() {
                return {};
            },

            onInstanceAdded: function(instance) {
                return extend({
                    instance: instance,
    
                    $isElevated: false
                }, getPrototypesOf(instance.Class));
            }
        }),
        PROTECTED_IDENTIFIER = '_$',
        //PRIVATE_IDENTIFIER = '_',
        Instance;

    Instance = {
        add: function(instance) {
            var Class = instance.Class,
                instanceHashPrefix = 'Object #<' + Class.getModuleName() + ':' + Class.getClassName() + '#',
                instances = classMap.getInstances(Class),
                instanceHash;

            do {
                instanceHash = instanceHashPrefix + generateHash('xx-x-x-x-xxx') + '>';
            }
            while (hasOwn(instances, instanceHash));

            // !!!IMPORTANT: never delete or override this method!!!
            instance.getHash = function() {
                return instanceHash;
            };

            ClassMap.addInstance(instance);

            return instance;
        },

        remove: function(instance) {
            ClassMap.removeInstance(instance);
        },

        exists: function(instance) {
            return existsClass(instance.Class) && !!classMap.getInstance(instance);
        },

        is: function(instance) {
            return instance && isClass(instance.Class) && instance.Class.isInstance(instance);
        },

        isElevated: function(instance) {
            return classMap.getInstance(instance).$isElevated;
        },

        elevate: function(instance) {
            var hiddenInstance = classMap.getInstance(instance);

            if(!hiddenInstance.$isElevated) {
                extend(instance, hiddenInstance[PROTECTED_IDENTIFIER]);
                hiddenInstance.$isElevated = true;
            }
        },

        commit: function(instance) {
            var hiddenInstance = classMap.getInstance(instance);

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

    return Instance;
});
