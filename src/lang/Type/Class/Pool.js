JARS.module('lang.Type.Class.Pool').$import(['.::enhance', '..ClassMap', {
    'lang.Object': ['::hasOwn', 'Info::size']
}]).$export(function(enhance, ClassMap, hasOwn, size) {
    'use strict';

    var FREE = 'free',
        RESERVED = 'reserved',
        AUTOADJUST_FACTOR = 'autoAdjustFactor',
        POOL_SIZE = 'poolSize',
        classMap = new ClassMap({
            onAdded: function() {
                return {
                    free: [],
        
                    reserved: {},
        
                    autoAdjustFactor: 0,
        
                    poolSize: 0
                };
            },
            
            onInstanceRemoved: function(instance) {
                var Class = instance.Class,
                    reservedInstances = classMap.get(Class, RESERVED),
                    freeInstances = classMap.get(Class, FREE);

                if(hasOwn(reservedInstances, instance.getHash())) {
                    delete reservedInstances[instance.getHash()];

                    if (size(reservedInstances) + freeInstances.length < Class.getPoolSize()) {
                        delete instance.getHash;

                        freeInstances.push(Class.NewBare(instance));
                    }
                }
            }
        }),
        MSG_POOL_EXHAUSTED = 'Pool exhausted',
        MSG_POOL_NOT_SHRINKABLE = 'Can\'t adjust poolsize. Not enough free instances available.',
        Pool;

    Pool = enhance({
        release: function(instance) {
            var Class = this;

            if (Class.isInstance(instance) && hasOwn(classMap.get(Class, RESERVED), instance.getHash())) {
                Class.destructInstance(instance);
            }
        },

        borrow: function(args) {
            var Class = this,
                poolExhausted = !Class.getAvailablePoolSize(),
                freeInstances = classMap.get(Class, FREE),
                autoAdjustFactor = classMap.get(Class, AUTOADJUST_FACTOR),
                instance;

            if (poolExhausted && autoAdjustFactor > 1) {
                Class.adjustPoolSize((Class.getPoolSize() || 1) * autoAdjustFactor);
                poolExhausted = false;
            }

            if (!poolExhausted) {
                instance = freeInstances.pop();
                instance.construct.apply(instance, args);
                classMap.get(Class, RESERVED)[instance.getHash()] = instance;
            }
            else {
                Class.logger.warn(MSG_POOL_EXHAUSTED);
            }

            return instance;
        },

        getPoolSize: function() {
            return classMap.get(this, POOL_SIZE);
        },

        getAvailablePoolSize: function() {
            return classMap.get(this, FREE).length;
        },

        adjustPoolSize: function(newSize) {
            var Class = this,
                poolSize = Class.getPoolSize(),
                sizeDiff = newSize - poolSize;

            if(Class.getAvailablePoolSize() + sizeDiff > 0) {
                classMap.set(Class, POOL_SIZE, poolSize + sizeDiff);
                (sizeDiff > 0 ? expandPool : shrinkPool)(Class, sizeDiff);
            }
            else {
                Class.logger.warn(MSG_POOL_NOT_SHRINKABLE);
            }

            return Class;
        },

        autoAdjustPoolSize: function(autoAdjustFactor) {
            classMap.set(this, AUTOADJUST_FACTOR, autoAdjustFactor);

            return this;
        }
    });

    function expandPool(Class, sizeDiff) {
        var freeInstances = classMap.get(Class, FREE);

        while(sizeDiff--) {
            freeInstances.push(Class.NewBare());
        }
    }

    function shrinkPool(Class, sizeDiff) {
        classMap.get(Class, FREE).length += sizeDiff;
    }

    return Pool;
});
