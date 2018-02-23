JARS.module('lang.Type.Class', ['Access', 'Destructors', 'ExtendedPrototypeBuilder', 'Inheritance', 'Instance', 'Module', 'Pool', 'PrototypeBuilder']).$import([{
    System: ['::isA', 'Logger', 'Formatter::format', 'Modules::getCurrentModuleData'],
    lang: ['::sandbox', 'Function::identity', 'Array::slice', {
        Object: ['Derive::map', 'Extend::copy', 'Iterate::each', {
            Extend: ['::extend', '::merge']
        }]
    }]
}, '.ClassMap']).$export(function(isA, Logger, format, getCurrentModuleData, sandbox, identity, slice, map, copy, objectEach, extend, merge, ClassMap) {
    'use strict';

    var CLASS = 'Class',
        classMap = ClassMap.withKey(CLASS, identity),
        MetaClass = sandbox('__META_CLASS__').add('Function'),
        accessIdentifiers = {
            _: 'private',
            _$: 'protected'
        },
        typeClassLogger = Logger.forCurrentModule(),
        CLASS_BLUEPRINT = 'return function ${name}(){return this instanceof ${name}?${name}.New(this,arguments):${name}.New(arguments);}',
        RE_CLASS = /^[A-Z]\w+$/,
        MSG_INVALID_OR_EXISTING_CLASS = 'Invalid or already existing Class: ${hash}',
        TypeClass;

    MetaClass.prototype.toString = function() {
        return this.getHash();
    };

    TypeClass = {
        enhance: function(methods) {
            extend(MetaClass.prototype, methods);

            return map(methods, function(method) {
                return function(Class) {
                    return method.apply(Class, slice(arguments, 1));
                };
            });
        },

        add: function(name, prototypeBuilder, staticProperties) {
            var moduleName = getCurrentModuleData().moduleName,
                classHash = createClassHash(name, moduleName),
                Class;

            if (RE_CLASS.test(name) && !classMap.hasHash(classHash)) {
                Class = MetaClass(format(CLASS_BLUEPRINT, {
                    name: name
                }))();

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

                ClassMap.add(Class);

                objectEach(accessIdentifiers, function(alias, id) {
                    setPrototype(Class, id, prototypeBuilder.getHidden(Class, id, alias));
                });

                extend(Class.prototype, prototypeBuilder.getPublic(Class));
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

        remove: ClassMap.remove,

        getPrototypesOf: function(Class) {
            return map(accessIdentifiers, function(alias, id) {
                return copy(getPrototype(Class, id));
            });
        },

        exists: function(Class) {
            return !!classMap.get(Class, CLASS);
        },

        is: function(Class) {
            return isA(Class, MetaClass);
        }
    };

    function getPrototype(Class, id) {
        return classMap.get(Class, getPrototypeKey(id));
    }

    function setPrototype(Class, id, proto) {
        classMap.set(Class, getPrototypeKey(id), proto);
    }

    function getPrototypeKey(id) {
        return id + 'proto';
    }

    function createClassHash(name, moduleName) {
        return 'Class #<' + moduleName + ':' + name + '>';
    }

    return TypeClass;
});
