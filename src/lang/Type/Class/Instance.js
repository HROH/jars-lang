JARS.module('lang.Type.Class.Instance').$import(['.::enhance', '..ClassMap', '.ExtendedPrototypeBuilder::isExtending', '..Instance::add', {
    lang: ['Constant::FALSE', 'Object.Info::values', {
        Array: ['Reduce::reduce', 'Find::find'],
        Function: ['::identity', 'Advice::around']
    }],
    System: ['::isA', '::isFunction']
}]).$export(function(enhance, ClassMap, isExtending, addInstance, FALSE, values, arrayReduce, find, identity, around, isA, isFunction) {
    'use strict';

    var instantiationPredicates = [],
        SKIP_CONSTRUCTOR = 'skipConstructor',
        classMap = ClassMap.withKey(SKIP_CONSTRUCTOR, FALSE, {
            onInstanceAdded: identity
        }),
        Instance;

    Instance = enhance({
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
                returnValue, foundFail;

            /*
             * isExtending() is true when a Subclass is inheriting over Subclass.extendz(Superclass)
             * In this case we don't need the constructor to be executed neither do we need a new instance to be saved
             */
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
                        /*
                         * We came here because Class.New was called directly
                         * [ Class.New([arg1, arg2, ...]) <--> new Class(arg1, arg2, ...) ]
                         * So we have to create a new instance and return it
                         */
                        args = instanceOrArgs;

                        returnValue = instanceOrArgs = Class.NewBare();
                    }

                    Class.construct(instanceOrArgs, args);
                }
            }

            return returnValue;
        },

        NewBare: around(function(instance) {
            var Class = this;

            return Class.isInstance(instance) ? Class.New(instance) : new Class();
        }, createConstructorToggle(true), createConstructorToggle(false)),

        construct: function(instance, args) {
            if (!classMap.get(this, SKIP_CONSTRUCTOR) && instance.construct) {
                instance.construct.apply(instance, args);
            }
        },

        isInstance: function(instance) {
            return isA(instance, this);
        },
        /**
         * @return {Array.<Object>}
         */
        getInstances: function(includeSubclasses) {
            return arrayReduce(includeSubclasses ? this.getSubclasses() : [], function(instances, Subclass) {
                return instances.concat(Subclass.getInstances(true));
            }, values(classMap.getInstances(this)));
        },

        getInstance: function(instanceHash) {
            return classMap.getInstances(this)[instanceHash] || null;
        }
    });

    function createConstructorToggle(skipConstructor) {
        return function() {
            classMap.set(this, SKIP_CONSTRUCTOR, skipConstructor);
        };
    }

    /**
     * @param {function(Class):Boolean} predicate
     * @param {String} message
     * @param {function(Class):*} optionalReturn
     */
    Instance.isNewableWhen = function(predicate, message, optionalReturn) {
        instantiationPredicates.push({
            predicate: predicate,

            message: message,

            ret: optionalReturn
        });
    };

    return Instance;
});
