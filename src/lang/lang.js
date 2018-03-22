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
    'String.*',
    'transcollectors.*',
    'transducers',
    'transformer.*',
    'Type.*'
]).$import(['*!Helpers/Object', 'System::isString']).$export(function(ObjectHelper, isString) {
    'use strict';

    var sandboxes = {},
        container = document.documentElement,
        __SANDBOX__ = '__SANDBOX__',
        hasOwnProp = ObjectHelper.hasOwnProp,
        lang;

    /**
     * @namespace
     *
     * @alias module:lang
     */
    lang = {
        /**
         * @param {string} formatString
         *
         * @return {string}
         */
        generateHash: function(formatString) {
            return formatString.replace(/x/g, randomHex);
        },
        /**
         * @param {string} domain
         *
         * @return {module:lang~Sandbox}
         */
        sandbox: function(domain) {
            return sandboxes[domain] || (sandboxes[domain] = new Sandbox(domain));
        }
    };

    /**
     * @memberof module:lang
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
     * @class
     *
     * @memberof module:lang
     * @inner
     *
     * @param {string} domain
     */
    function Sandbox(domain) {
        var sandbox = this,
            iframe = document.createElement('iframe'),
            sandboxWindow, sandboxDoc;

        iframe.style.display = 'none';
        iframe.id = domain + '#' + lang.generateHash('xx-x-x-x-xxx');
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

    /**
     * @memberof module:lang
     * @inner
     *
     * @return {string}
     */
    function randomHex() {
        return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
    }

    return lang;
});
