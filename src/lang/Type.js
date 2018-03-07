JARS.module('lang.Type', ['Class', 'ClassMap', 'Instance', 'Method']).meta({
    plugIn: function(pluginRequest, getInternal) {
        var SubjectsRegistry = getInternal('Registries/Subjects'),
            BundleResolver = getInternal('Resolvers/Bundle'),
            requestor = pluginRequest.requestor,
            EXTENSION_DELIMITER = ',',
            EXTENSION_BUNDLE = 'All',
            MSG_MISSING_SUBMODULE = 'couldn\'t find submodule "${0}"';

        requestor.setMeta({
            plugIn: function(typePluginRequest) {
                var requestedExtensions = typePluginRequest.info.data.split(EXTENSION_DELIMITER),
                    requestorBundle = SubjectsRegistry.get(BundleResolver.getBundleName(requestor.name)),
                    extensions = [],
                    extLen = requestedExtensions.length,
                    idx = 0,
                    extensionModule;

                if (requestedExtensions[0] === EXTENSION_BUNDLE) {
                    extensions = [requestorBundle.name];
                }
                else {
                    while (idx < extLen) {
                        extensionModule = requestorBundle.dependencies.find(requestedExtensions[idx]);

                        extensionModule ? extensions.push(extensionModule.name) : typePluginRequest.state.setAborted(MSG_MISSING_SUBMODULE, [requestedExtensions[idx]]);
                        idx++;
                    }
                }

                typePluginRequest.$import(extensions);
                typePluginRequest.$export(function extensionsLoaded() {
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
