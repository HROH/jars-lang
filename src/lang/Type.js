JARS.module('lang.Type', ['Class', 'ClassMap', 'Instance', 'Method']).meta({
    plugIn: function(pluginRequest, getInternal) {
        'use strict';

        var each = getInternal('Helpers/Array').each,
            requestor = pluginRequest.requestor,
            requestorBundle = requestor.getParentBundle(),
            EXTENSION_DELIMITER = ',',
            EXTENSION_BUNDLE = 'All',
            MSG_MISSING_SUBMODULE = 'couldn\'t find submodule "${0}"';

        requestor.setMeta({
            plugIn: function(typePluginRequest) {
                var extensions = typePluginRequest.info.data.split(EXTENSION_DELIMITER),
                    dependencies = [],
                    extensionModule;

                if (extensions[0] === EXTENSION_BUNDLE) {
                    dependencies = [requestorBundle.name];
                }
                else {
                    each(extensions, function(extension) {
                        extensionModule = requestorBundle.dependencies.find(extension);

                        extensionModule ? dependencies.push(extensionModule.name) : typePluginRequest.abort(MSG_MISSING_SUBMODULE, [extension]);
                    });
                }

                typePluginRequest.$import(dependencies);
                typePluginRequest.$export(function() {
                    return this;
                });
            }
        });

        pluginRequest.$export(function() {
            return this.sandboxNative(pluginRequest.info.data);
        });
    }
}).$import(['*!Helpers/Object', '.::sandbox', {
    System: ['::env', '::isFunction', 'Modules!']
}]).$export(function(ObjectHelper, sandbox, env, isFunction, config) {
    'use strict';

    var SYSTEM_SANDBOX = '__SYSTEM__',
        nativeTypes = {},
        nativeTypeSandbox = sandbox(SYSTEM_SANDBOX),
        hasOwnProp = ObjectHelper.hasOwnProp,
        each = ObjectHelper.each,
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
            // TODO always overide? !hasOwnProp(typePrototype, methodName)
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
