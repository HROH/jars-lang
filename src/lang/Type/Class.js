JARS.module('lang.Type.Class', ['Access', 'Destructors', 'ExtendedPrototypeBuilder', 'Inheritance', 'Instance', 'Module', 'Pool', 'PrototypeBuilder']).$import({
    System: ['::isA', 'Logger', 'Formatter::format', 'Modules::getCurrentModuleData'],
    lang: ['::sandbox', 'Array.Iterate::each'],
    'lang.Object': ['::hasOwn', 'Derive::map', 'Extend::copy', 'Reduce::reduce', 'Iterate::each', {
        Extend: ['::extend', '::merge']
    }]
}).$export(function(isA, Logger, format, getCurrentModuleData, sandbox, arrayEach, hasOwn, map, copy, reduce, objectEach, extend, merge) {
    'use strict';

    var Classes = {},
        metaClassSandbox = sandbox('__META_CLASS__'),
        MetaClass = metaClassSandbox.add('Function'),
        accessIdentifiers = {
            _: 'private',
            _$: 'protected'
        },
        typeClassLogger = Logger.forCurrentModule(),
        addListeners = [],
        removeListeners = [],
        CLASS_BLUEPRINT = '(function(){function ${name}(){return this instanceof ${name}?${name}.New(this,arguments):${name}.New(arguments)};return ${name}})()',
        RE_CLASS = /^[A-Z]\w+$/,
        MSG_INVALID_OR_EXISTING_CLASS = 'Invalid or already existing Class: ${hash}',
        TypeClass;

    MetaClass.prototype.toString = function() {
        return this.getHash();
    };

    TypeClass = {
        enhance: function(methods) {
            extend(MetaClass.prototype, methods);
        },

        add: function(name, prototypeBuilder, staticProperties) {
            var moduleName = getCurrentModuleData().moduleName,
                classHash = createClassHash(name, moduleName),
                Class;

            if (RE_CLASS.test(name) && !hasOwn(Classes, classHash)) {
                Class = metaClassSandbox.add(format(CLASS_BLUEPRINT, {
                    name: name
                }));

                merge(Class, {
                    prototype: {
                        constructor: Class,

                        Class: Class,

                        toString: function() {
                            return this.getHash();
                        }
                    },

                    logger: new Logger(classHash),

                    getHash: function() {
                        return classHash;
                    },

                    getClassName: function() {
                        return name;
                    },

                    getModuleName: function() {
                        return moduleName;
                    }
                }, staticProperties);

                // Store a reference of the Class and define some protected properties
                Classes[classHash] = {
                    Class: Class
                };

                objectEach(accessIdentifiers, function(alias, id) {
                    setPrototype(Class, id, prototypeBuilder.getHidden(Class, id, alias));
                });

                extend(Class.prototype, prototypeBuilder.getPublic(Class));

                arrayEach(addListeners, function(listener) {
                    listener(Class);
                });
            }
            else {
                typeClassLogger.warn(MSG_INVALID_OR_EXISTING_CLASS, {
                    hash: classHash
                });
            }

            return Class;
        },

        addWithSuperclass: function(Class, Superclass, prototypeBuilder, staticProperties) {
            objectEach(accessIdentifiers, function(alias, id) {
                setPrototype(Class, id, prototypeBuilder.getHidden(Class, id, alias, getPrototype(Class, id), getPrototype(Superclass, id)));
            });

            Class.prototype = prototypeBuilder.getPublic(Class, Superclass);

            // extend Class with static methods of Superclass
            extend(Class, staticProperties || {}, Superclass);
        },

        remove: function(Class) {
            metaClassSandbox.remove(format(CLASS_BLUEPRINT, {
                name: Class.getClassName()
            }));

            arrayEach(removeListeners, function(listener) {
                listener(Class);
            });

            delete Classes[Class.getHash()];
        },

        onAdded: function(listener) {
            addListeners.push(listener);
        },

        onRemoved: function(listener) {
            removeListeners.push(listener);
        },

        getPrototypesOf: function(Class) {
            return map(accessIdentifiers, function(alias, id) {
                return copy(getPrototype(Class, id));
            });
        },
        /**
         * @param {String} classHashOrName
         * @param {String} moduleName
         *
         * @return {Class}
         */
        get: function(classHashOrName, moduleName) {
            return (Classes[classHashOrName] || Classes[createClassHash(classHashOrName, moduleName || getCurrentModuleData().moduleName)] || {}).Class;
        },
        /**
         *
         * @return {Array<Class>}
         */
        getAll: function() {
            return reduce(Classes, function(allClasses, classData) {
                allClasses.push(classData.Class);

                return allClasses;
            }, []);
        },

        exists: function(Class) {
            return hasOwn(Classes, Class.getHash());
        },

        is: function(Class) {
            return isA(Class, MetaClass);
        }
    };

    function getPrototype(Class, id) {
        return Classes[Class.getHash()][id + 'proto'];
    }

    function setPrototype(Class, id, proto) {
        Classes[Class.getHash()][id + 'proto'] = proto;
    }

    function createClassHash(name, moduleName) {
        return 'Class #<' + moduleName + ':' + name + '>';
    }

    return TypeClass;
});
