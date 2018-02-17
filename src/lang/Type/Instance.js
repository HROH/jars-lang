JARS.module('lang.Type.Instance').$import(['System.Formatter::format', 'lang::generateHash', 'lang.Function.Advice::after', 'lang.Constant', '.ClassMap', {
    '.Class': ['::exists', '::is', '::getPrototypesOf'],
    'lang.Object': ['::hasOwn', 'Extend::extend', 'Manipulate::update']
}]).$export(function(format, generateHash, after, Constant, ClassMap, existsClass, isClass, getPrototypesOf, hasOwn, extend, update) {
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
        INSTANCE_HASH = 'Object #<${module}:${Class}#${hash}>',
        PROTECTED_IDENTIFIER = '_$',
        //PRIVATE_IDENTIFIER = '_',
        Instance;

    Instance = {
        add: after(function(instance) {
            // never delete or override this method
            instance.getHash = Constant(createInstanceHash(instance));
            
            return instance;
        }, ClassMap.addInstance),

        remove: ClassMap.removeInstance,

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
                update(hiddenInstance[PROTECTED_IDENTIFIER], after(function(value, property) {
                    return instance[property];
                }, function(value, property) {
                    delete instance[property];
                }));

                hiddenInstance.$isElevated = false;
            }
        }
    };

    function createInstanceHash(instance) {
        var Class = instance.Class,
            instances = classMap.getInstances(Class),
            instanceHash;

            do {
                instanceHash = format(INSTANCE_HASH, {
                    module: Class.getModuleName(),
                    Class: Class.getClassName(),
                    hash: generateHash('xx-x-x-x-xxx')
                });
            }
            while (hasOwn(instances, instanceHash));

        return instanceHash;
    }

    return Instance;
});
