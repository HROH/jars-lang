JARS.module('lang.Type.Class.Instance').$import(['.::enhance', '.::onAdded', '.::onRemoved', '.ExtendedPrototypeBuilder::isExtending', {
    '..Instance': ['::add', '::onAdded', '::onRemoved'],
    'lang.Object': ['Info::values'],
    'lang.Array': ['Reduce::reduce', 'Find::find'],
    'System': ['::isA', '::isFunction']
}]).$export(function(enhance, onClassAdded, onClassRemoved, isExtending, addInstance, onInstanceAdded, onInstanceRemoved, values, arrayReduce, find, isA, isFunction) {
    'use strict';

    var Classes = {},
        instantiationPredicates = [],
        Instance;

    Instance = {
        isNewableWhen: isNewableWhen,

        isOf: function(Class, instance) {
            return Class.isInstance(instance);
        },

        get: function(Class, instanceHash) {
            return Class.getInstance(instanceHash);
        },

        getAll: function(Class, includeSubclasses) {
            return Class.getInstances(includeSubclasses);
        },

        New: function(Class, instance, args) {
            return Class.New(instance, args);
        },

        NewBare: function(Class, instance) {
            return Class.NewBare(instance);
        }
    };

    enhance({
        /**
         * Initiates a new instance
         *
         * @param {(Object|Array)} instanceOrArgs
         * @param {Array} args
         *
         * @return {(Object|undefined)} instance if singleton exists, called directly or via Class.extendz, empty object if abstract, else undefined
         */
        New: function(instanceOrArgs, args) {
            var Class = this,
                construct, returnValue, foundFail;

            // isExtending() is true when a Subclass is inheriting over Subclass.extendz(Superclass)
            // In this case we don't need the constructor to be executed neither do we need a new instance to be saved
            if (isExtending(Class)) {
                returnValue = instanceOrArgs;
            }
            else {
                foundFail = find(instantiationPredicates, function(predicateData) {
                    return !predicateData.predicate(Class);
                });

                if (foundFail) {
                    Class.logger.warn(foundFail.message);

                    returnValue = foundFail.ret(Class);
                }
                else {
                    if (Class.isInstance(instanceOrArgs) && !isFunction(instanceOrArgs.getHash)) {
                        instanceOrArgs = addInstance(instanceOrArgs);
                    }
                    else {
                        // We came here because Class.New was called directly
                        // [ Class.New([arg1, arg2, ...]) <--> new Class(arg1, arg2, ...) ]
                        // So we have to create a new instance and return it
                        args = instanceOrArgs;

                        returnValue = instanceOrArgs = Class.NewBare();
                    }

                    construct = instanceOrArgs.construct;

                    if (!Classes[Class.getHash()].skipConstructor && construct) {
                        construct.apply(instanceOrArgs, args);
                    }
                }
            }

            return returnValue;
        },

        NewBare: function(instance) {
            var Class = this;

            Classes[Class.getHash()].skipConstructor = true;
            instance = Class.isInstance(instance) ? Class.New(instance) : new Class();
            Classes[Class.getHash()].skipConstructor = false;

            return instance;
        },

        isInstance: function(instance) {
            return isA(instance, this);
        },
        /**
         * @return {Array.<Object>}
         */
        getInstances: function(includeSubclasses) {
            var instances = values(Classes[this.getHash()].instances);

            return includeSubclasses ? arrayReduce(this.getSubclasses(), function(instances, Subclass) {
                return instances.concat(Subclass.getInstances(true));
            }, instances) : instances;
        },

        getInstance: function(instanceHash) {
            return Classes[this.getHash()].instances[instanceHash] || null;
        }
    });

    /**
     * @param {function(Class):Boolean} predicate
     * @param {function(Class):*} optionalReturn
     * @param {String} message
     */
    function isNewableWhen(predicate, optionalReturn, message) {
        instantiationPredicates.push({
            predicate: predicate,

            message: message,

            ret: optionalReturn
        });
    }

    onClassAdded(function(Class) {
        Classes[Class.getHash()] = {
            skipConstructor: false,

            instances: {}
        };
    });

    onClassRemoved(function(Class) {
        delete Classes[Class.getHash()];
    });

    onInstanceAdded(function(instance) {
        Classes[instance.Class.getHash()].instances[instance.getHash()] = instance;
    });

    onInstanceRemoved(function(instance) {
        delete Classes[instance.Class.getHash()].instances[instance.getHash()];
    });

    return Instance;
});
