JARS.module('lang.Type.Class.Pool').$import(['.::enhance', '::onAdded', '::onRemoved', '..Instance::onRemoved', {
    Object: ['::hasOwn', 'Info::size']
}]).$export(function(enhance, onClassAdded, onClassRemoved, onInstanceRemoved, hasOwn, size) {
    'use strict';

    var Classes = {},
        MSG_POOL_EXHAUSTED = 'Pool exhausted',
        MSG_POOL_NOT_SHRINKABLE = 'Can\'t adjust poolsize. Not enough free instances available.',
        Pool;

    Pool = {
        release: function(Class, instance) {
            return Class.release(instance);
        },

        borrow: function(Class, args) {
            return Class.borrow(args);
        },

        getPoolSize: function(Class) {
            return Class.getPoolSize();
        },

        getAvailablePoolSize: function(Class) {
            return Class.getAvailablePoolSize();
        },

        adjustPoolSize: function(Class, size) {
            return Class.adjustPoolSize(size);
        },

        autoAdjustPoolSize: function(Class, autoAdjustFactor) {
            return Class.autoAdjustPoolSize(autoAdjustFactor);
        }
    };

    onClassAdded(function(Class) {
        Classes[Class.getHash()] = {
            free: [],

            reserved: {},

            autoAdjustFactor: 0,

            poolSize: 0
        };
    });

    onClassRemoved(function(Class) {
        delete Classes[Class.getHash()];
    });

    onInstanceRemoved(function(instance) {
        var Class = instance.Class,
            reservedInstances = getReservedInstances(Class),
            freeInstances = getFreeInstances(Class);

        if(hasOwn(reservedInstances, instance.getHash())) {
            delete reservedInstances[instance.getHash()];

            if (size(reservedInstances) + freeInstances.length < Classes[Class.getHash()].poolSize) {
                delete instance.getHash;

                freeInstances.push(Class.NewBare(instance));
            }
        }
    });

    enhance({
        release: function(instance) {
            var Class = this;

            if (Class.isInstance(instance) && hasOwn(getReservedInstances(Class), instance.getHash())) {
                Class.destructInstance(instance);
            }
        },

        borrow: function(args) {
            var Class = this,
                poolExhausted = !Class.getAvailablePoolSize(),
                freeInstances = getFreeInstances(Class),
                autoAdjustFactor = Classes[Class.getHash()].autoAdjustFactor,
                instance;

            if (poolExhausted && autoAdjustFactor > 0) {
                Class.adjustPoolSize(Class.getPoolSize() * autoAdjustFactor);
                poolExhausted = false;
            }

            if (!poolExhausted) {
                instance = freeInstances.pop();
                instance.construct.apply(instance, args);
                getReservedInstances(Class)[instance.getHash()] = instance;
            }
            else {
                Class.logger.warn(MSG_POOL_EXHAUSTED);
            }

            return instance;
        },

        getPoolSize: function() {
            return Classes[this.getHash()].poolSize;
        },

        getAvailablePoolSize: function() {
            return getFreeInstances(this).length;
        },

        adjustPoolSize: function(newSize) {
            var Class = this,
                sizeDiff = newSize - Class.getPoolSize(),
                freeInstances = getFreeInstances(Class);

            if(freeInstances.length + sizeDiff < 0) {
                Class.logger.warn(MSG_POOL_NOT_SHRINKABLE);
            }
            else {
                Classes[Class.getHash()].poolSize += sizeDiff;

                if (sizeDiff > 0) {
                    while (sizeDiff--) {
                        freeInstances.push(Class.NewBare());
                    }
                }
                else {
                    freeInstances.length += sizeDiff;
                }
            }

            return Class;
        },

        autoAdjustPoolSize: function(autoAdjustFactor) {
            Classes[this.getHash()].autoAdjustFactor = autoAdjustFactor;

            return this;
        }
    });

    function getFreeInstances(Class) {
        return Classes[Class.getHash()].free;
    }

    function getReservedInstances(Class) {
        return Classes[Class.getHash()].reserved;
    }

    return Pool;
});
