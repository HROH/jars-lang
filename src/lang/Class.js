JARS.module('lang.Class', ['Abstract', 'Final', 'Singleton']).$import([{
    System: [{
        Modules: ['::getCurrentModuleData', '::use']
    }, 'Logger', '::isA', '::isNil', '::isObject', '::isFunction'],
    '.Object': ['::from', '::hasOwn', '!All'],
    '.Function': ['!Advice', '::apply', '::attempt']
}, '.Array!Check,Find,Index,Iterate,Manipulate']).$export(function(getCurrentModuleData, useModule, Logger, isA, isNil, isObject, isFunction, fromObject, hasOwn, Obj, Fn, applyFunction, attempt, Arr) {
    'use strict';

    var lang = this,
        metaClassSandbox = lang.sandbox('__SYSTEM__.Class'),
        MetaClass = metaClassSandbox.add('Function'),
        protectedIdentifier = '_$',
        //privateIdentifier = '_',
        accessIdentifiers = fromObject({
            _: 'private',
            _$: 'protected'
        }),
        excludeOverride = Arr('Class', 'constructor', 'getHash', '$proxy'),
        rClass = /^[A-Z]\w+$/,
        Classes = Obj(),
        classBluePrint = ['(function(){function ', '(){return this instanceof ', '?', '.New(this,arguments):', '.New(arguments)};return ', '})()'],
        MSG_ALREADY_DESTRUCTED = 'Proxy failed! ${hash} was already destructed!',
        MSG_INVALID_OR_EXISTING_CLASS = 'Invalid or already existing Class: ${hash}',
        MSG_WRONG_CLASS = 'Proxy failed! ${instanceHash} must be an instance of ${classHash}!',
        MSG_WRONG_CLASS_AND_MODULE = 'Proxy failed! ${instanceHash} must be an instance of ${classHash} or in one of the following modules: ${missingAccess}, but has only access to ${hasAccess}!',
        MSG_WRONG_CONTEXT = 'Proxy failed! Method was called in wrong context!',
        MSG_WRONG_MODULE = 'Proxy failed! ${instanceHash} must be in one of the following modules: ${missingAccess}, but has only access to ${hasAccess}!',
        extensionPredicates = Arr(),
        instantiationPredicates = Arr(),
        ClassProtectedProperties, classFactoryLogger;

    classFactoryLogger = Logger.forCurrentModule();

    function instanceOrClassExists(instanceOrClass, checkInstance) {
        var exists = false;

        if (checkInstance && instanceOrClassExists(instanceOrClass.Class) || isClass(instanceOrClass)) {
            (exists = !! getHidden(instanceOrClass, checkInstance)) || proxyDestructed(instanceOrClass.getHash());
        }

        return exists;
    }

    function getHidden(instanceOrClass, fromInstance) {
        return (fromInstance ? getHidden(instanceOrClass.Class)[protectedIdentifier]._$instances : Classes)[instanceOrClass.getHash()];
    }

    function proxy(instanceOrClass, method, args, forInstance) {
        var result;

        if (instanceOrClassExists(instanceOrClass, forInstance)) {
            result = getHidden(instanceOrClass, forInstance).$inPrivileged ? applyFunction(method, instanceOrClass, args) : safeProxy(instanceOrClass, method, args, forInstance);
        }

        return result;
    }

    function safeProxy(instanceOrClass, method, args, forInstance) {
        var instanceOrClassHidden = getHidden(instanceOrClass, forInstance),
            result;

        prepareBeforeProxy(instanceOrClass, instanceOrClassHidden, protectedIdentifier);

        result = attempt(function(){
            return applyFunction(method, instanceOrClass, args);
        });

        cleanupAfterProxy(instanceOrClass, instanceOrClassHidden, protectedIdentifier);

        if(result.error) {
            throw new Error(result.error.message);
        }

        return result.value;
    }

    function prepareBeforeProxy(instanceOrClass, instanceOrClassHidden, accessIdentifier) {
        instanceOrClassHidden.$inPrivileged = true;

        Obj.extend(instanceOrClass, instanceOrClassHidden[accessIdentifier]);
    }

    function cleanupAfterProxy(instanceOrClass, instanceOrClassHidden, accessIdentifier) {
        instanceOrClassHidden.$inPrivileged = false;

        instanceOrClassHidden[accessIdentifier].update(function updateHiddenProperty(value, property) {
            /*jslint validthis: true */
            var newValue = instanceOrClass[property];

            delete instanceOrClass[property];

            return newValue;
        });
    }

    function proxyDestructed(destructedHash) {
        classFactoryLogger.error(MSG_ALREADY_DESTRUCTED, {
            hash: destructedHash
        });
    }

    function createProxyFor(proxyType, proxyData) {
        var Class = proxyData.Class,
            moduleName = proxyData.module,
            isProxyDataCollected = false;

        /*jslint validthis: true */
        function proxiedMethod() {
            var instance, method, args, result;

            if (proxyType === 'instance') {
                instance = this,
                method = proxyData.method,
                args = arguments;
            }
            else {
                instance = arguments[0];
                method = arguments[1];
                args = arguments[2];

                if (!isProxyDataCollected) {
                    if (proxyType === 'class') {
                        moduleName = Class.getModuleBaseName();
                    }
                    else if (proxyType === 'module') {
                        Class = useModule(moduleName);
                    }

                    isProxyDataCollected = true;
                }
            }

            if (isProxyAllowed(instance, Class, moduleName)) {
                result = proxy(instance, method, args || [], true);
            }

            return result;
        }

        return proxiedMethod;
    }

    function createProxy() {
        return createProxyFor('module', {
            module: getCurrentModuleData().moduleName
        });
    }

    function createProxyForPrivilegedMethod(method) {
        /*jslint validthis: true */
        var privilegedMethod = createProxyFor('instance', {
            method: method,
            Class: this
        });

        privilegedMethod.arity = method.length || method.arity || 0;

        return privilegedMethod;
    }

    function isProxyAllowed(instance, Class, moduleName) {
        var canProxy = false,
            shouldHaveModuleAccess = !! moduleName,
            shouldHaveClassAccess = isClass(Class),
            failMessage = MSG_WRONG_CONTEXT,
            instanceClass, failData;

        if (isInstance(instance)) {
            failData = fromObject({
                instanceHash: instance.getHash()
            });

            instanceClass = instance.Class;

            if (shouldHaveModuleAccess && !(canProxy = shouldHaveClassAccess ? instanceClass.canAccessClass(Class) : instanceClass.canAccessModule(moduleName))) {
                failMessage = MSG_WRONG_MODULE;
                failData.extend({
                    hasAccess: instanceClass.getModuleAccess().join(', '),
                    missingAccess: shouldHaveClassAccess ? Class.getModuleAccess().join(', ') : moduleName
                });
            }

            if (!canProxy && shouldHaveClassAccess && !(canProxy = isA(instance, Class))) {
                failMessage = shouldHaveModuleAccess ? MSG_WRONG_CLASS_AND_MODULE : MSG_WRONG_CLASS;
                failData.extend({
                    classHash: Class.getHash()
                });
            }
        }

        canProxy || classFactoryLogger.error(failMessage, failData);

        return canProxy;
    }

    function createClassHash(name, moduleName) {
        return 'Class #<' + moduleName + ':' + name + '>';
    }

    function retrieveClass(allClasses, classData) {
        allClasses.push(classData.Class);

        return allClasses;
    }

    function retrieveSubclasses(subclasses, subclassHash) {
        var Subclass = getClass(subclassHash);

        subclasses.push(Subclass);
        subclasses.merge(Subclass.getSubclasses(true));

        return subclasses;
    }

    function retrieveInstances(instances, instanceData) {
        instances.push(instanceData.instance);

        return instances;
    }

    function retrieveSubclassInstances(instances, subclassHash) {
        return instances.merge(getClass(subclassHash).getInstances(true));
    }

    function destructSubclass(Subclass) {
        Subclass.destruct(Subclass);
    }

    ClassProtectedProperties = fromObject({
        _$isProto: false,

        _$skipCtor: false,

        _$superclassHash: '',

        _$modBaseName: null,

        _$modAccess: null,
        /**
         * @param {string} method
         * @param {function()} methodName
         */
        _$overrideMethod: function(method, methodName) {
            var Class = this,
                classHiddenProto = Class._$proto,
                protoToOverride,
                Superclass = getClass(Class._$superclassHash),
                superclassHiddenProto,
                superProto, superMethod, currentSuper;

            // Never override Class()-, constructor()-, $proxy()- and getHash()-methods
            if (Superclass && isFunction(method) && !excludeOverride.contains(methodName)) {
                superclassHiddenProto = getHidden(Superclass)[protectedIdentifier]._$proto;

                if (methodName in Superclass.prototype) {
                    protoToOverride = Class.prototype;
                    superProto = Superclass.prototype;
                }
                else if (methodName in superclassHiddenProto) {
                    protoToOverride = classHiddenProto;
                    superProto = superclassHiddenProto;
                }

                // check if the method is overriding a method in the Superclass.prototype and is not already overridden in the current Class.prototype
                if (superProto && isFunction(superProto[methodName]) && superProto[methodName] !== method && (!hasOwn(protoToOverride, methodName) || protoToOverride[methodName] === method)) {
                    superMethod = function $super() {
                        return applyFunction(superProto[methodName], this, arguments);
                    };

                    protoToOverride[methodName] = Fn.around(method, function beforeMethodCall() {
                        currentSuper = this.$super;

                        // create a new temporary this.$super that uses the method of the Superclass.prototype
                        this.$super = superMethod;

                    }, function afterMethodCall() {
                        // restore or delete this.$super
                        if (currentSuper) {
                            this.$super = currentSuper;
                        }
                        else {
                            delete this.$super;
                        }
                    });
                }
            }
        }
    });

    function overridePrototypeMethods(protoToOverride) {
        /*jslint validthis: true */
        Obj.each(protoToOverride, this._$overrideMethod, this);
    }

    addStatic({
        /**
         * Initiates a new instance
         * Although it accesses hidden properties on the Class
         * it doesn't use 'proxyClass()' to achieve this
         * The reason is that this method calls 'construct()' on the instance
         * so there would be a possibility to manipulate the hidden Class-properties
         *
         * @param {(Object|Array)} instance
         * @param {Array} args
         *
         * @return {(Object|undefined)} instance if singleton exists, called directly or via Class.extendz, empty object if abstract, else undefined
         */
        New: function(instance, args) {
            var Class = this,
                logger = Class.logger,
                classProtectedProps = getHidden(Class)[protectedIdentifier],
                instances = classProtectedProps._$instances,
                instanceHashPrefix, instanceHash, construct, returnValue, failingPredicate;

            // Class._$isProto is true when a Subclass is inheriting over Subclass.extendz(Superclass)
            // In this case we don't need the constructor to be executed neither do we need a new instance to be saved
            if (classProtectedProps._$isProto) {
                returnValue = instance;
            }
            else {
                failingPredicate = instantiationPredicates.find(predicateFails, Class);

                if (failingPredicate) {
                    logger.warn(failingPredicate.message);

                    returnValue = failingPredicate.ret(Class);
                }
                else {
                    if (isA(instance, Class) && !isFunction(instance.getHash)) {
                        // If we have a new instance that is not stored in the instances yet
                        // create a unique hash for it and store a reference under this hash for later use.
                        // This hash is also used to store the private/protected properties/methods.
                        //
                        // Note: If an instance isn't used anymore this reference has to be deleted over the destructor of the instance
                        // Otherwise this could lead to memory leaks if there are too many instances
                        instanceHashPrefix = 'Object #<' + classProtectedProps._$modName + ':' + classProtectedProps._$clsName + '#';

                        do {
                            instanceHash = instanceHashPrefix + lang.generateHash('xx-x-x-x-xxx') + '>';
                        }
                        while (hasOwn(instances, instanceHash));

                        // !!!IMPORTANT: never delete or override this method!!!
                        instance.getHash = function() {
                            return instanceHash;
                        };

                        instances[instanceHash] = {
                            instance: instance,

                            $inPrivileged: false,

                            $destructors: Arr(),
                            // protected
                            _$: classProtectedProps._$proto.copy(),
                            // TODO private
                            _: Obj()
                        };
                    }
                    else {
                        // We came here because Class.New was called directly
                        // [ Class.New([arg1, arg2, ...]) <--> new Class(arg1, arg2, ...) ]
                        // So we have to create a new instance and return it
                        args = instance;

                        returnValue = instance = Class.NewBare();
                    }

                    construct = instance.construct;

                    if (!classProtectedProps._$skipCtor && construct) {
                        applyFunction(construct, instance, args);
                    }
                }
            }

            return returnValue;
        },

        NewBare: function(instance) {
            var Class = this,
                classProtectedProps = getHidden(Class)[protectedIdentifier];

            classProtectedProps._$skipCtor = true;
            instance = Class.isInstance(instance) ? Class.New(instance) : new Class();
            classProtectedProps._$skipCtor = false;

            return instance;
        },

        toString: function() {
            return this.getHash();
        },
        /**
         *
         *
         * @return {boolean}
         */
        hasSuperclass: function() {
            return !!this.getSuperclass();
        },
        /**
         *
         *
         * @return {boolean}
         */
        hasSubclasses: function() {
            return this.getSubclasses().length > 0;
        },
        /**
         *
         *
         * @param {Class} Superclass
         *
         * @return {boolean}
         */
        isSubclassOf: function(Superclass) {
            return isClass(Superclass) && isA(this.prototype, Superclass);
        },
        /**
         *
         *
         * @param {Class} Superclass
         *
         * @return {boolean}
         */
        isSuperclassOf: function(Subclass) {
            return isClass(Subclass) && isA(Subclass.prototype, this);
        },
        /**
         *
         *
         * @param {Class} Class
         *
         * @return {boolean}
         */
        isOf: function(Class) {
            return this === Class || this.isSubclassOf(Class);
        },

        isInstance: function(instance) {
            return isA(instance, this);
        },

        getModule: function() {
            return useModule(this.getModuleName());
        },

        getModuleBase: function() {
            return useModule(this.getModuleBaseName());
        },

        canAccessClass: function(Class) {
            return isClass(Class) && Arr.some(Class.getModuleAccess(), this.canAccessModule, this);
        },

        canAccessModule: function(moduleName) {
            return this.getModuleAccess().some(isModuleNameStartingWith, moduleName);
        },

        createSubclass: function(name, proto, staticProperties) {
            return ClassFactory(name, proto, staticProperties).extendz(this);
        },
        /**
         * Returns the name of the Class like it was passed to 'lang.Class()'
         *
         * @return {String} the classname that the Class was created with
         */
        $getClassName: function() {
            return this._$clsName;
        },
        /**
         * Returns the name of the module in which the Class was created
         *
         * @return {string} the modulename
         */
        $getModuleName: function() {
            return this._$modName;
        },

        $getModuleBaseName: function() {
            var Class = this,
                moduleName = Class._$modName,
                baseName = Class._$modBaseName;

            if (isNil(baseName)) {
                Class._$modBaseName = baseName = (useModule(moduleName) === Class) ? moduleName.substring(0, moduleName.lastIndexOf('.')) || moduleName : moduleName;
            }

            return baseName;
        },

        $getModuleAccess: function() {
            var Class = this,
                moduleAccess = Class._$modAccess,
                baseName;

            if (!moduleAccess) {
                Class._$modAccess = moduleAccess = Arr();

                do {
                    baseName = Class.getModuleBaseName();
                    moduleAccess.contains(baseName) || moduleAccess.push(baseName);
                    Class = Class.getSuperclass();
                } while (isClass(Class));
            }

            return moduleAccess;
        },
        /**
         * @return {Class} the Superclass of this Class
         */
        $getSuperclass: function() {
            return getClass(this._$superclassHash);
        },
        /**
         * @return {Array.<Class>} an array of all Subclasses
         */
        $getSubclasses: function(includeSubclasses) {
            return includeSubclasses ? this._$subclassHashes.reduce(retrieveSubclasses, Arr()) : this._$subclassHashes.values().map(getClass);
        },
        /**
         * Method to mimick classical inheritance in JS
         * It uses prototypal inheritance inside but makes developing easier
         * To call a parent-method use this.$super(arg1, arg2, ...)
         *
         * Note: The Superclass has to be created with lang.Class()
         *
         * Example:
         *
         *		var MySubclass = lang.Class('MySubclass', {
         *			construct: function() {
         *				//constructor-code goes here...
         *				this.$super(arg1, arg2) // Call the constructor of the Superclass
         *			},
         *
         *			myMethod: function(param) {
         *				// do something...
         *				this.$super(param) // Call the myMethod-method of the Superclass
         *			}
         *		}).extendz(MyClass);
         *
         * For simplification you can use MyClass.createSubclass('MySubclass', ...)
         *
         *
         * @param {Class} Superclass
         *
         * @return {Class}
         */
        $extendz: function(Superclass, proto, staticProperties) {
            var Class = this,
                data = {
                    Class: Class,
                    Superclass: Superclass
                },
                superclassHiddenProtectedProps, message, failingPredicate;

            failingPredicate = extensionPredicates.find(predicateFails, data);

            if (failingPredicate) {
                message = 'The Class can\'t be extended! ' + failingPredicate.message;
                Superclass = data.Superclass;

                Class.logger.error(message, {
                    superclassHash: Superclass && Superclass.getHash()
                });

                Class = data.Class;
            }
            else {
                buildPrototypeMapping(Class, proto);

                superclassHiddenProtectedProps = getHidden(Superclass)[protectedIdentifier];
                // add Superclass reference
                Class._$superclassHash = Superclass.getHash();
                // extend own private/protected prototype with that of the Superclass
                Class._$proto.extend(superclassHiddenProtectedProps._$proto);
                // add Subclass reference in the Superclass
                superclassHiddenProtectedProps._$subclassHashes[Class.getHash()] = Class.getHash();

                // Prevent the default constructor and objectHash-generation to be executed
                superclassHiddenProtectedProps._$isProto = true;
                // Create a new instance of the Superclass and merge it with the current prototype
                // to override in the correct order
                Class.prototype = Obj.merge(new Superclass(), Class.prototype);
                // end inheriting
                superclassHiddenProtectedProps._$isProto = false;

                // extend Class with static methods of Superclass
                Obj.extend(Class, staticProperties || {}, Superclass);

                // Check if methods in the public and the protected prototype were overridden
                // and do it properly so that this.$super() works in instances
                Arr.each([Class.prototype, Class._$proto], overridePrototypeMethods, Class);
            }

            return Class;
        },
        /**
         * @return {Array.<Object>}
         */
        $getInstances: function(includeSubclasses) {
            var instances = this._$instances.reduce(retrieveInstances, Arr());

            if (includeSubclasses) {
                instances = this._$subclassHashes.reduce(retrieveSubclassInstances, instances);
            }

            return instances;
        },

        $getInstance: function(instanceHash) {
            var instanceData = this._$instances[instanceHash];

            return instanceData ? instanceData.instance : false;
        },
        /**
         * @param {function():void} destructor
         * @param {Object} instance
         *
         * @return {Class}
         */
        $addDestructor: function(destructor, instance) {
            var Class = this,
                destructors;

            if (isFunction(destructor)) {
                if (isA(instance, Class)) {
                    destructors = getHidden(instance, true).$destructors;
                }
                else {
                    destructors = Class._$destructors;
                }

                destructors.push(destructor);
            }

            return Class;
        },
        /**
         * @param {Object} instance
         *
         * @return {Class}
         */
        $destruct: function(instance) {
            var Class = this;

            if (isInstance(instance)) {
                destructInstance(instance, Class);
            }
            else {
                destructClass(Class);
            }

            return Class;
        }
    });

    function destructClass(Class) {
        var classHash = Class.getHash(),
            Superclass = getClass(Class._$superclassHash);

        Class.getInstances().each(function(instance) {
            destructInstance(instance, Class);
        });

        Class.getSubclasses().each(destructSubclass);

        if (Superclass) {
            delete getHidden(Superclass)[protectedIdentifier]._$subclassHashes[classHash];
        }

        metaClassSandbox.remove(classBluePrint.join(Class.getClassName()));

        delete Classes[classHash];
    }

    function destructInstance(instance, Class) {
        var instanceHash = instance.getHash(),
            instances = Class._$instances,
            destructors;

        if (isA(instance, Class) && hasOwn(instances, instanceHash)) {
            destructors = instances[instanceHash].$destructors;

            do {
                destructors.mergeUnique(getHidden(Class)[protectedIdentifier]._$destructors);
                Class = Class.getSuperclass();
            } while (Class);

            while (destructors.length) {
                proxy(instance, destructors.shift(), true);
            }

            delete instances[instanceHash];
        }
        else if (instance.Class !== Class) {
            instance.Class.destruct(instance);
        }
        else {
            Class.logger.warn('"' + instanceHash + '" is already destructed');
        }
    }

    isExtendableWhen(function superclassIsGiven(data) {
        return isClass(data.Superclass);
    }, 'There is no Superclass given!');

    isExtendableWhen(function superclassIsNotSelf(data) {
        return data.Superclass !== data.Class;
    }, 'The Class can\'t extend itself!');

    isExtendableWhen(function classHasNoSuperclass(data) {
        var hasNoSuperclass = !data.Class.hasSuperclass();

        hasNoSuperclass || (data.Superclass = data.Class.getSuperclass());

        return hasNoSuperclass;
    }, 'The Class already has the Superclass: "${superclassHash}"!');

    isExtendableWhen(function classHasNoInstancesAndSubclasses(data) {
        return !data.Class.getInstances().length && !data.Class.hasSubclasses();
    }, 'The Class already has instances or Subclasses!');

    isExtendableWhen(function superclassIsNoSubclassOfClass(data) {
        return !data.Superclass.isSubclassOf(data.Class);
    }, 'The given Superclass: "${superclassHash}" is already inheriting from this Class!');

    function predicateFails(predicateData) {
        /*jslint validthis: true */
        return !predicateData.predicate(this);
    }

    function isModuleNameStartingWith(moduleAccess) {
        /*jslint validthis: true */
        return this.indexOf(moduleAccess) === 0;
    }

    /**
     * This method is used to add methods like 'implementz' or 'mixin'
     * to all Classes, when the module is loaded
     * Added methods are automatically available to every Class
     *
     * @param {(String|Object.<string, function()>)} methodName
     * @param {(function()|undefined)} method
     */
    function addStatic(methodName, method) {
        var methods = {};

        if (isObject(methodName)) {
            methods = methodName;
        }
        else {
            methods[methodName] = method;
        }

        Obj.reduce(methods, addProxiedMetaMethod, MetaClass.prototype);
    }

    function addProxiedMetaMethod(metaProto, method, methodName) {
        var newMethod = method;

        if (!hasOwn(metaProto, methodName) || methodName === 'toString') {
            if (methodName.indexOf('$') === 0) {
                methodName = methodName.substring(1);

                newMethod = function proxiedMetaMethod() {
                    return proxy(this, method, arguments);
                };
            }

            metaProto[methodName] = newMethod;
        }

        return metaProto;
    }

    /**
     *
     * @param {function(Class):Boolean} predicate
     * @param {function(Class):*} optionalReturn
     * @param {String} message
     */
    function isInstanceableWhen(predicate, optionalReturn, message) {
        instantiationPredicates.push({
            predicate: predicate,

            message: message,

            ret: optionalReturn
        });
    }

    /**
     *
     * @param {function(Class):Boolean} predicate
     * @param {String} message
     */
    function isExtendableWhen(predicate, message) {
        extensionPredicates.push({
            predicate: predicate,

            message: message
        });
    }

    /**
     * @param {Class} Class
     *
     * @return {Boolean}
     */
    function isClass(Class) {
        return isA(Class, MetaClass);
    }

    /**
     * @param {Object} instance
     *
     * @return {Boolean}
     */
    function isInstance(instance) {
        return instance && isClass(instance.Class) && isA(instance, instance.Class);
    }

    /**
     * @param {String} classHashOrName
     * @param {String} moduleName
     *
     * @return {Class}
     */
    function getClass(classHashOrName, moduleName) {
        return (Classes[classHashOrName] || Classes[createClassHash(classHashOrName, moduleName || getCurrentModuleData().moduleName)] || {}).Class;
    }

    /**
     *
     * @return {Array<Class>}
     */
    function getClasses() {
        return Classes.reduce(retrieveClass, Arr());
    }

    /**
     * @param {(Class|String)} ClassOrHash
     * @param {Boolean} includeSubclasses
     *
     * @return {(Array.<Object>|undefined)}
     */
    function getInstances(ClassOrHash, includeSubclasses) {
        if (!isClass(ClassOrHash)) {
            ClassOrHash = getClass(ClassOrHash);
        }

        return ClassOrHash ? ClassOrHash.getInstances(includeSubclasses) : undefined;
    }

    function buildPrototypeMapping(Class, proto) {
        if (proto) {
            Class.prototype.extend(proto);
            accessIdentifiers.each(buildAccessLookupPrototype, Class);
            buildPrivilegedMethods(Class);
        }
    }

    //TODO
    /**
     * @param {String} accessIdentifierAlias
     * @param {String} accessIdentifier
     */
    function buildAccessLookupPrototype(accessIdentifierAlias, accessIdentifier) {
        /*jslint validthis: true */
        var Class = this,
            classHidden = getHidden(Class),
            proto = Class.prototype,
            hiddenProto = classHidden[accessIdentifier][accessIdentifier + 'proto'];

        if (hasOwn(proto, accessIdentifier) || hasOwn(proto, accessIdentifierAlias)) {
            Obj.each(proto[accessIdentifier] || proto[accessIdentifierAlias], function addHiddenProperty(value, property) {
                hiddenProto[accessIdentifier + property] = value;
            });

            delete proto[accessIdentifier];
            delete proto[accessIdentifierAlias];
        }
    }

    function buildPrivilegedMethods(Class) {
        var proto = Class.prototype;

        if (hasOwn(proto, '$')) {
            proto.extend(Obj.map(Obj.filter(proto.$, isFunction), createProxyForPrivilegedMethod, Class));

            delete proto.$;
        }
    }

    /**
     * Function to create Classes in a more classical way
     * It is available as lang.Class(), later
     *
     * An example would be:
     *
     * var MyClass = lang.Class('MyClass', {
     *		construct: function() {
     *			//constructor-code goes here...
     *		},
     *
     *		myMethod: function(param) {
     *			//do something
     *		},
     *
     *		myMethod2: function()
     *			this.myMethod('test');
     *		}
     * });
     *
     *
     * @param {string} name
     * @param {Object<string, *>} proto
     * @param {Object<string, *>} staticProperties
     *
     * @return {Class}
     */
    function ClassFactory(name, proto, staticProperties) {
        var moduleName = getCurrentModuleData().moduleName,
            classHash = createClassHash(name, moduleName),
            Class;

        if (rClass.test(name) && !hasOwn(Classes, classHash)) {
            Class = metaClassSandbox.add(classBluePrint.join(name));

            Obj.merge(Class, {
                // Extend the prototype with some methods defined in Obj (see module lang.Object)
                prototype: Obj().extend({
                    constructor: Class,

                    Class: Class,

                    toString: function() {
                        return this.getHash();
                    }
                }),

                logger: new Logger(classHash),

                getHash: function() {
                    return classHash;
                }
            }, staticProperties);

            // Store a reference of the Class and define some protected properties
            Classes[classHash] = fromObject({
                Class: Class,

                $inPrivileged: false,

                _$: fromObject({
                    _$clsName: name,

                    _$modName: moduleName,

                    _$subclassHashes: Obj(),

                    _$proto: fromObject({
                        $proxy: createProxyFor('class', {
                            Class: Class
                        })
                    }),

                    _$instances: Obj(),

                    _$destructors: Arr()
                }).extend(ClassProtectedProperties),
                // TODO
                _: fromObject({
                    _proto: Obj()
                })
            });

            buildPrototypeMapping(Class, proto);
        }
        else {
            classFactoryLogger.warn(MSG_INVALID_OR_EXISTING_CLASS, {
                hash: classHash
            });
        }

        return Class;
    }

    Obj.extend(ClassFactory, {
        addStatic: addStatic,

        getClass: getClass,

        getClasses: getClasses,

        getInstances: getInstances,

        isClass: isClass,

        isInstance: isInstance,

        isInstanceableWhen: isInstanceableWhen,

        isExtendableWhen: isExtendableWhen,

        createProxy: createProxy
    });

    return ClassFactory;
});
