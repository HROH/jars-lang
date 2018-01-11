JARS.module('lang.ObjectInterface').$import([
    {
        System: [
            'Modules::getCurrentModuleData',
            'Logger',
            '::isFunction',
            '::isNumber'
        ]
    },
    '.Class',
    '.Array!check,derive,iterate'
]).$export(function(getCurrentModuleData, Logger, isFunction, isNumber, Class, Arr) {
    'use strict';

	// TODO
    var IMPLEMENTED_METHODS_MISSING = '${impl} must implement the method(s): "${missingMethods}" !',
        IMPLEMENTOR_MISSING = 'No Class, instance or Object given to check!',
        IMPLEMENTORTYPE_MISMATCH = 'You must provide a Class or instance to check',
        ObjectInterface;

    ObjectInterface = Class('ObjectInterface', {
        _$: {
            name: '',

            methods: null,

            logger: null,

            addMethod: function(method) {
                var methods = this._$methods;

                methods.some(checkMethodExists, method) || methods.push(method);
            }
        },

        $: {
            construct: function(interfaceName, methods) {
                this._$name = interfaceName;
                this._$methods = Arr.from(methods);
                this._$logger = new Logger('Interface "#<' + getCurrentModuleData().moduleName + ':' + interfaceName + '>"');
            },

            extendz: function(superInterface) {
                var iface = this;

                if (ObjectInterface.isInstance(superInterface)) {
                    iface.$proxy(superInterface, proxiedGetMethods).each(iface._$addMethod, iface);
                }

                return iface;
            },

            getName: function() {
                return this._$name;
            },

            isImplementedBy: function(implementor) {
                var logger = this._$logger,
                    methods = this._$methods,
                    isImplemented = false,
                    notImplementedMethods;

                if (implementor) {
                    notImplementedMethods = methods.filter(isMethodNotImplemented, implementor);

                    if (notImplementedMethods.length) {
                        logger.error(IMPLEMENTED_METHODS_MISSING, {
                            impl: implementor,

                            missingMethods: notImplementedMethods.map(transformMethodData).join('", "')
                        });
                    }
                    else {
                        isImplemented = true;
                    }
                }
                else {
                    logger.warn(IMPLEMENTOR_MISSING);
                }

                return isImplemented;
            }
        }
    }, {
        isImplementedBy: function(interfaces, implementor, checkAny) {
            return Arr.every(interfaces, implementzInterface, {
                impl: implementor,

                any: checkAny
            });
        }
    });

    function proxiedGetMethods() {
        /*jslint validthis: true */
        return this._$methods;
    }

    function checkMethodExists(method) {
        /*jslint validthis: true */
        return method[0] === this[0];
    }

    function isMethodNotImplemented(methodData) {
        /*jslint validthis: true */
        var methodToCheck = this[methodData[0]],
            args = methodData[1];

        return !isFunction(methodToCheck) || (isNumber(args) && !(args === methodToCheck.length || args === methodToCheck.arity));
    }

    function transformMethodData(methodData) {
        return methodData.join(' (arguments: ') + ')';
    }

    function implementzInterface(iface) {
        /*jslint validthis: true */
        return iface.isImplementedBy(this.impl, this.any);
    }

    return ObjectInterface;
});
