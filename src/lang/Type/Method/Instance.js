JARS.module('lang.Type.Method.Instance').$import([{
    System: ['Logger', 'Formatter::format', {
        Modules: ['::getCurrentModuleData', '::use']
    }],
    lang: [{
        Function: ['::apply', '::getArity', '::setArity', '::noop', 'Guards::once', {
            Advice: ['::around', '::before']
        }]
    }, 'Array.Find::find'],
    '..Class': ['::is', 'Access']
}, '..Instance']).$export(function(Logger, format, getCurrentModuleData, use, applyFunction, getArity, setArity, noop, once, around, before, find, isClass, Access, TypeInstance) {
    'use strict';

    var instanceLogger = Logger.forCurrentModule(),
        privilegedPrediates = [],
        applyPrivileged = around(applyFunction, TypeInstance.elevate, TypeInstance.commit, {
            handleThrow: true
        }),
        MSG_PRIVILEGED_ERROR = 'Could not call privileged method. ',
        MSG_PRIVILEGED_WRONG_CLASS = 'Must be an instance of ${Class}',
        MSG_PRIVILEGED_WRONG_MODULE = 'Requires module access to ${missingAccess}, but has only access to ${hasAccess}',
        Instance;

    Instance = {
        privilegedWithClass: function(Class) {
            var moduleName;

            return before(function(instance, method, args) {
                return handlePrivileged(Class, instance, method, args, moduleName);
            }, once(function() {
                moduleName = Class.getModuleBaseName();
            }));
        },

        privileged: function(Class, method) {
            return setArity(function() {
                return handlePrivileged(Class, this, method, arguments);
            }, getArity(method));
        },

        privilegedWithModule: function() {
            var moduleName = getCurrentModuleData().moduleName,
                Class;

            return before(function(instance, method, args) {
                return handlePrivileged(Class, instance, method, args, moduleName);
            }, once(function() {
                Class = use(moduleName);
            }));
        }
    };

    function handlePrivileged(Class, instance, method, args, moduleName) {
        return canCallPrivileged(instance, Class, moduleName) ? applyPrivileged(method, instance, args || []) : undefined;
    }

    function canCallPrivileged(instance, Class, moduleName) {
        var foundFail = find(privilegedPrediates, function(predicateData) {
            return !predicateData.predicate(instance, Class, moduleName);
        });

        foundFail && instanceLogger.error(MSG_PRIVILEGED_ERROR + foundFail.message, foundFail.getData(instance, Class, moduleName));

        return !foundFail;
    }

    function isPrivilegedWhen(predicate, message, getData) {
        privilegedPrediates.push({
            predicate: predicate,

            message: message,

            getData: getData || noop
        });
    }

    isPrivilegedWhen(function(instance, Class, moduleName) {
        return isClass(Class) || !!moduleName;
    }, 'No class or module defined!');

    isPrivilegedWhen(TypeInstance.is, 'No instance!');

    isPrivilegedWhen(TypeInstance.exists, '${instance} was already destructed!', function(instance) {
        return {
            instance: instance.getHash()
        };
    });

    isPrivilegedWhen(function(instance, Class, moduleName) {
        return (isClass(Class) && Class.isInstance(instance)) || Access.canAccessClass(instance, Class) || Access.canAccessModule(instance.Class, moduleName);
    }, '${instance} has no access. ${details}', function(instance, Class, moduleName) {
        return {
            instance: instance.getHash(),

            details: getModuleAccessFailData(instance.Class, moduleName, Class) || getClassAccessFailData(instance, Class)
        };
    });

    function getModuleAccessFailData(instance, moduleName, Class) {
        return moduleName ? format(MSG_PRIVILEGED_WRONG_MODULE, {
            hasAccess: Access.getModuleAccess(instance.Class).join(', '),

            missingAccess: isClass(Class) ? Access.getModuleAccess(Class).join(', ') : moduleName
        }) : '';
    }

    function getClassAccessFailData(instance, Class) {
        return isClass(Class) ? format(MSG_PRIVILEGED_WRONG_CLASS, {
            Class: Class.getHash()
        }) : '';
    }

    return Instance;
});
