JARS.module('lang.Type', ['Class', 'ClassMap', 'Instance', 'Method']).meta({
    plugIn: function(pluginRequest) {
        var requestor = pluginRequest.requestor,
            EXTENSION_DELIMITER = ',',
            EXTENSION_BUNDLE = 'All';

        requestor.setMeta({
            plugIn: function(typePluginRequest) {
                var requestedExtensions = typePluginRequest.info.data.split(EXTENSION_DELIMITER),
                    extensions = [],
                    extLen = requestedExtensions.length,
                    idx = 0,
                    extension;

                if (requestedExtensions[0] === EXTENSION_BUNDLE) {
                    extensions = [requestor.bundle.name];
                }
                else {
                    while (idx < extLen) {
                        extension = requestor.bundle.find(requestedExtensions[idx]);

                        extension ? extensions.push(extension) : typePluginRequest.fail('Couldn\'t find submodule "' + requestedExtensions[idx] + '"');
                        idx++;
                    }
                }

                typePluginRequest.$importAndLink(extensions, function extensionsLoaded() {
                    return this;
                });
            }
        });

        pluginRequest.$export(function() {
            return this.sandboxNative(pluginRequest.info.data);
        });
    }
}).$import(['.::sandbox', {
    System: ['::env', '::isFunction', '::$$internals', '!']
}]).$export(function(sandbox, env, isFunction, internals, config) {
    'use strict';

    var SYSTEM_SANDBOX = '__SYSTEM__',
        nativeTypes = {},
        nativeTypeSandbox = sandbox(SYSTEM_SANDBOX),
        ObjectHelpers = internals.get('Helpers/Object'),
        hasOwnProp = ObjectHelpers.hasOwnProp,
        each = ObjectHelpers.each,
        Type;

    Type = {
        /**
         * @param {string} typeString
         *
         * @return {Object}
         */
        sandboxNative: function(typeString) {
            var Type = nativeTypes[typeString] || createNativeType(typeString);

            return Type;
        }
    };

    /**
     * @memberof lang.Type
     * @inner
     *
     * @param {String} typeString
     *
     * @return {Object}
     */
    function createNativeType(typeString) {
        var Type = config.allowProtoOverride ? env.global[typeString] : nativeTypeSandbox.add(typeString);

        Type.enhance = function(prototypeMethods, staticProps) {
            return addStaticProps(Type, staticProps, addPrototypeMethods(Type, prototypeMethods));
        };

        nativeTypes[typeString] = Type;

        return Type;
    }

    function addPrototypeMethods(Type, prototypeMethods) {
        var typePrototype = Type.prototype,
            enhanced = {};

        each(prototypeMethods, function(prototypeMethod, methodName) {
            // TODO always overide?
            // !hasOwnProp(typePrototype, methodName)
            if (isFunction(prototypeMethod)) {
                typePrototype[methodName] = prototypeMethod;
            }

            hasOwnProp(Type, methodName) || (Type[methodName] = createDelegate(typePrototype[methodName]));
            enhanced[methodName] = Type[methodName];
        });

        return enhanced;
    }

    function addStaticProps(Type, staticProps, enhanced) {
        each(staticProps, function(staticProp, key) {
            hasOwnProp(Type, key) || (Type[key] = staticProp);
            enhanced[key] = Type[key];
        });

        return enhanced;
    }

    /**
     * @memberof lang.Type
     * @inner
     *
     * @param {function} method
     *
     * @return {function(*):*}
     */
    function createDelegate(method) {
        /**
         * @param {*} targetObject
         *
         * @return {*}
         */
        return function delegater(targetObject) {
            return method.apply(targetObject, sliceArgs(arguments));
        };
    }

    function sliceArgs(args) {
        var slicedArgs = [],
                argsLen = args.length;

            while (--argsLen > 0) {
                slicedArgs[argsLen - 1] = args[argsLen];
            }

        return slicedArgs;
    }

    return Type;
});
