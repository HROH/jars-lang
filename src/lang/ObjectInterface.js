JARS.module('lang.ObjectInterface').$import([{
    System: ['Modules::getCurrentModuleData', 'Logger', '::isFunction', '::isNumber'],
    '.Array': ['Iterate::each', {
        Check: ['::some', '::every'],
        Derive: ['::filter', '::map']
    }]
}, '.Class', '.Function::getArity']).$export(function(getCurrentModuleData, Logger, isFunction, isNumber, each, some, every, filter, map, Class, getArity) {
    'use strict';

    var MSG_IMPLEMENTED_METHODS_MISSING = '${implementor} must implement the method(s): "${missingMethods}" !',
        MSG_IMPLEMENTOR_MISSING = 'No implementor given to check!',
        ObjectInterface;

    ObjectInterface = Class('ObjectInterface', {
        $: {
            construct: function(interfaceName, methods) {
                this._$name = this.Class.getClassName() + ' #<' + getCurrentModuleData().moduleName + ':' + interfaceName + '>';
                this._$methods = methods || [];
                this._$logger = new Logger(this._$name);
            },

            extendz: function(superInterface) {
                var iface = this;

                if (iface.Class.isInstance(superInterface)) {
                    each(iface.$proxy(superInterface, function() {
                        return this._$methods;
                    }), iface._$addMethod, iface);
                }

                return iface;
            },

            getName: function() {
                return this._$name;
            },

            isImplementedBy: function(implementor) {
                var isImplemented = false,
                    notImplementedMethods;

                if (this._$hasImplementor(implementor)) {
                    notImplementedMethods = this._$findNotImplemented(implementor);

                    if (notImplementedMethods.length) {
                        this._$logNotImplemented(implementor, notImplementedMethods);
                    }
                    else {
                        isImplemented = true;
                    }
                }

                return isImplemented;
            }
        },

        _$: {
            name: '',

            methods: null,

            logger: null,

            addMethod: function(newMethod) {
                var methods = this._$methods;

                some(methods, function(method) {
                    return method[0] === newMethod[0];
                }) || methods.push(newMethod);
            },

            hasImplementor: function(implementor) {
                var hasImplementor = false;

                if(implementor) {
                    hasImplementor = true;
                }
                else {
                    this._$logger.warn(MSG_IMPLEMENTOR_MISSING);
                }

                return hasImplementor;
            },

            findNotImplemented: function(implementor) {
                return filter(this._$methods, function(methodData) {
                    var methodToCheck = implementor[methodData[0]],
                        arity = methodData[1];

                    return !isFunction(methodToCheck) || (isNumber(arity) && arity !== getArity(methodToCheck));
                });
            },

            logNotImplemented: function(implementor, notImplementedMethods) {
                this._$logger.error(MSG_IMPLEMENTED_METHODS_MISSING, {
                    implementor: implementor,

                    missingMethods: map(notImplementedMethods, function(methodData) {
                        return methodData.join(' (arguments: ') + ')';
                    }).join('", "')
                });
            }
        }
    }, {
        isImplementedBy: function(interfaces, implementor) {
            return every(interfaces, function(iface) {
                return iface.isImplementedBy(implementor);
            });
        }
    });

    return ObjectInterface;
});
