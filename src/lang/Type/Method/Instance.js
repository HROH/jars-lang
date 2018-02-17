JARS.module('lang.Type.Method.Instance').$import([{
    System: ['Logger', {
        Modules: ['::getCurrentModuleData', '::use']
    }],
    'lang.Function': ['::apply', '::attempt', '::getArity', '::setArity', 'Advice::before', 'Guards::once'],
    '..Class': ['::is', 'Access']
}, '..Instance', 'lang.Object.Extend::extend']).$export(function(Logger, getCurrentModuleData, use, applyFunction, attempt, getArity, setArity, before, once, isClass, Access, TypeInstance, extend) {
    'use strict';

    var instanceLogger = Logger.forCurrentModule(),
        OR = ' or ',
        MSG_PRIVILEGED_MISSING_DATA = 'Calling privileged method failed! No class or module defined',
        MSG_PRIVILEGED_NO_INSTANCE = 'Calling privileged method failed! Method was called with no instance!',
        MSG_PRIVILEGED_FAILED = 'Calling privileged method failed! ${instance} must be ',
        MSG_PRIVILEGED_WRONG_CLASS = 'an instance of ${Class}',
        MSG_PRIVILEGED_WRONG_MODULE = 'in one of the following modules: ${missingAccess}, but has only access to ${hasAccess}',
        MSG_PRIVILEGED_ALREADY_DESTRUCTED = 'Calling privileged method failed! ${instance} was already destructed!',
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
        return canCallPrivileged(instance, Class, moduleName) ? callPrivileged(instance, method, args || []) : undefined;
    }

    function canCallPrivileged(instance, Class, moduleName) {
        var message, data;

        if(isMissingData(Class, moduleName)) {
            message = MSG_PRIVILEGED_MISSING_DATA;
        }
        else if(!TypeInstance.is(instance)) {
            message = MSG_PRIVILEGED_NO_INSTANCE;
        }
        else if(!TypeInstance.exists(instance)) {
            message = MSG_PRIVILEGED_ALREADY_DESTRUCTED;
            data = {
                instance: instance.getHash()
            };
        }
        else if(!hasAccess(instance, Class, moduleName)) {
            message = getAccessFailMessage(Class, moduleName);
            data = extend({
                instance: instance.getHash()
            }, getModuleAccessFailData(instance.Class, moduleName, Class), getClassAccessFailData(instance, Class));
        }

        message && instanceLogger.error(message, data);

        return !message;
    }

    function isMissingData(Class, moduleName) {
        return !isClass(Class) && !moduleName;
    }

    function hasAccess(instance, Class, moduleName) {
        return (isClass(Class) && TypeInstance.is(instance)) || Access.canAccessClass(instance.Class, Class) || Access.canAccessModule(instance.Class, moduleName);
    }

    function getAccessFailMessage(Class, moduleName) {
        var message;

        if(isClass(Class)) {
            message = MSG_PRIVILEGED_WRONG_CLASS;
        }

        if(!moduleName) {
            message = (message ? message + OR : '') + MSG_PRIVILEGED_WRONG_MODULE;
        }

        return MSG_PRIVILEGED_FAILED + message;
    }

    function getModuleAccessFailData(InstanceClass, moduleName, Class) {
        return moduleName ? {
            hasAccess: Access.getModuleAccess(InstanceClass).join(', '),

            missingAccess: isClass(Class) ? Access.getModuleAccess(Class).join(', ') : moduleName
        } : {};
    }

    function getClassAccessFailData(instance, Class) {
        return isClass(Class) ? {
            Class: Class.getHash()
        } : {};
    }

    function callPrivileged(instance, method, args) {
        return TypeInstance.isElevated(instance) ? applyFunction(method, instance, args) : callElevatedPrivileged(instance, method, args);
    }

    function callElevatedPrivileged(instance, method, args) {
        var result;

        TypeInstance.elevate(instance);

        result = attempt(function(){
            return applyFunction(method, instance, args);
        });

        TypeInstance.commit(instance);

        if(result.error) {
            throw result.error;
        }

        return result.value;
    }

    return Instance;
});
