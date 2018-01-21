JARS.module('lang', [
    'Array.*',
    'assert.*',
    'Class.*',
    'Constant',
    'Date',
    'Enum',
    'Function.*',
    'I$Comparable',
    'I$Iterable',
    'Interface',
    'M$Cloneable',
    'M$Destructable',
    'Mixin',
    'Object.*',
    'operations.*',
    'String'
]).meta({
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
						extension = requestor.bundle.find(requestedExtensions[idx++]);

						extension ? extensions.push(extension) : typePluginRequest.fail('Couldn\'t find submodule');
					}
				}

				typePluginRequest.$importAndLink(extensions, function extensionsLoaded() {
					return this;
				});
			}
        });

		pluginRequest.success();
    }
}).$import({
    System: ['::env', '::isString', '::$$internals', '!']
}).$export(function(env, isString, internals, config) {
    'use strict';

    var sandboxes = {},
        container = document.documentElement,
        __SANDBOX__ = '__SANDBOX__',
        SYSTEM_SANDBOX = '__SYSTEM__',
        hasOwn = {}.hasOwnProperty,
        nativeTypes = {},
        nativeTypeSandbox, lang;

    function hasOwnProp(object, property) {
        return hasOwn.call(object, property);
    }

    /**
     * @namespace lang
     */
    lang = {
        /**
         * @access public
         *
         * @memberof lang
         *
         * @param {string} typeString
         *
         * @return {Object}
         */
        sandboxNativeType: function(typeString) {
            var Type = getNativeType(typeString);

            Type.enhance || (Type.enhance = function(prototypeMethods, staticMethods) {
                return enhanceNativeType(Type, prototypeMethods, staticMethods);
            });

            return Type;
        },
        /**
         * @access public
         *
         * @memberof lang
         *
         * @param {String} formatString
         *
         * @return {String}
         */
        generateHash: function(formatString) {
            return formatString.replace(/x/g, randomHex);
        },

        /**
         * @access public
         *
         * @memberOf lang
         *
         * @param {String} domain
         *
         * @return {lang~Sandbox}
         */
        sandbox: function(domain) {
            return sandboxes[domain] || (sandboxes[domain] = new Sandbox(domain));
        }
    };

    /**
     * @access private
     *
     * @memberOf lang
     * @inner
     *
     * @param {Function} methodName
     *
     * @return {function(*):*}
     */
    function createDelegate(method) {
        /**
         *
         * @param {*} targetObject
         *
         * @return {*}
         */
        function delegater(targetObject) {
            var slicedArgs = [],
                argLen = arguments.length;

            while (--argLen) {
                slicedArgs[argLen - 1] = arguments[argLen];
            }

            return method.apply(targetObject, slicedArgs);
        }

        return delegater;
    }

    /**
     * @access private
     *
     * @memberOf lang
     * @inner
     *
     * @param {HTMLDocument} sandboxDoc
     * @param {string} scriptText
     */
    function createSandboxScript(sandboxDoc, scriptText) {
        var sandboxScript = sandboxDoc.createElement('script');

        sandboxScript.type = 'text/javascript';
        sandboxScript.text = scriptText;

        sandboxDoc.body.appendChild(sandboxScript);
    }

    /**
     * <p>Hack to steal native objects like Object, Array, String, etc. from an iframe
     * We save the native object in an iframe as a property of the window object
     * and then access this property for example to extend the <code>Object.prototype</code>
     * The <code>Object.prototype</code> of the current document won't be affected by this.</p>
     *
     * <p>Note: the iframe has to be open all the time to make sure
     * that the current document has access to the native copies in some browsers.</p>
     *
     * <p>You can read more about this {@link http://dean.edwards.name/weblog/2006/11/hooray/|here}</p>
     *
     * @todo check browser support (should work in all legacy browsers)
     *
     * @access private
     *
     * @memberof lang
     * @inner
     *
     * @class Sandbox
     *
     * @param {string} domain
     */
    function Sandbox(domain) {
        var sandbox = this,
            iframe = document.createElement('iframe'),
            sandboxWindow, sandboxDoc;

        iframe.style.display = 'none';
        iframe.id = domain;
        container.appendChild(iframe);
        sandboxWindow = iframe.contentWindow;
        sandboxDoc = sandboxWindow.document;
        //fire the onload event of the iframe
        //this is necessary so that the iframe doesn't block window.onload of the main page
        //found on http://www.aaronpeters.nl/blog/iframe-loading-techniques-performance?%3E
        sandboxDoc.open();
        //iframe onload happens after document.close()
        sandboxDoc.close();

        createSandboxScript(sandboxDoc, 'window.' + __SANDBOX__ + '={}');

        sandbox[__SANDBOX__] = sandboxWindow[__SANDBOX__];
        sandbox.doc = sandboxDoc;
    }

    /**
     * @access public
     *
     * @method add
     * @memberof lang~Sandbox#
     *
     * @param {string} value
     *
     * @return {*}
     */
    Sandbox.prototype.add = function(value) {
        var sandbox = this,
            sandboxVars = sandbox[__SANDBOX__],
            sandboxedVar, accessor;

        if (isString(value)) {
            accessor = encodeURI(value);

            if (!hasOwnProp(sandboxVars, accessor)) {
                createSandboxScript(sandbox.doc, __SANDBOX__ + '["' + accessor + '"]=' + value);
            }

            sandboxedVar = sandboxVars[accessor];
        }

        return sandboxedVar;
    };

    /**
     * @access public
     *
     * @method remove
     * @memberof lang~Sandbox#
     *
     * @param {string} value
     */
    Sandbox.prototype.remove = function(value) {
        var sandbox = this,
            sandboxVars = sandbox[__SANDBOX__],
            accessor;

        if (isString(value)) {
            accessor = encodeURI(value);

            if (hasOwnProp(sandboxVars, accessor)) {
                delete sandboxVars[accessor];
            }
        }
    };

    nativeTypeSandbox = lang.sandbox(SYSTEM_SANDBOX);

    /**
     * @access private
     *
     * @memberof lang
     * @inner
     *
     * @param {String} typeString
     *
     * @return {Object}
     */
    function getNativeType(typeString) {
        var Type = nativeTypes[typeString] || (config.allowProtoOverride ? env.global[typeString] : nativeTypeSandbox.add(typeString));

        nativeTypes[typeString] || (nativeTypes[typeString] = Type);

        return Type;
    }

    function enhanceNativeType(Type, prototypeMethods, staticMethods) {
        addPrototypeMethods(Type, prototypeMethods);

        addStaticMethods(Type, staticMethods);

        return Type;
    }

    function addPrototypeMethods(Type, prototypeMethods) {
        var typePrototype = Type.prototype,
            methodName;

        for (methodName in prototypeMethods) {
            if (hasOwnProp(prototypeMethods, methodName)) {
                if (!hasOwnProp(typePrototype, methodName)) {
                    typePrototype[methodName] = prototypeMethods[methodName];
                }

                hasOwnProp(Type, methodName) || (Type[methodName] = createDelegate(typePrototype[methodName]));
            }
        }
    }

    function addStaticMethods(Type, staticMethods) {
        var methodName;

        for (methodName in staticMethods) {
            if (hasOwnProp(staticMethods, methodName) && !hasOwnProp(Type, methodName)) {
                Type[methodName] = staticMethods[methodName];
            }
        }
    }

    /**
     * @access private
     *
     * @memberOf lang
     * @inner
     *
     * @return {String}
     */
    function randomHex() {
        return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
    }

    return lang;
});
