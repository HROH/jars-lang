JARS.module('lang.Type.Class.Access').$import(['.::enhance', '.::is', '.Module::getBaseName', {
    'lang.Array': ['Check::some', 'Search::contains']
}]).$export(function(enhance, isClass, getModuleBaseName, some, contains) {
    'use strict';

    var Access = {
        canAccessClass: function(Class, ClassToAccess) {
            return Class.canAccessClass(ClassToAccess);
        },

        canAccessModule: function(Class, moduleName) {
            return Class.canAccessModule(moduleName);
        },

        getModuleAccess: function(Class) {
            return Class.getModuleAccess();
        }
    };

    enhance({
        canAccessClass: function(Class) {
            return isClass(Class) && some(Class.getModuleAccess(), this.canAccessModule, this);
        },

        canAccessModule: function(moduleName) {
            return !!moduleName && some(this.getModuleAccess(), function(moduleAccess) {
                return moduleName.indexOf(moduleAccess) === 0;
            });
        },

        getModuleAccess: function() {
            var Class = this,
                moduleAccess = [],
                baseName;

            do {
                baseName = getModuleBaseName(Class);
                contains(moduleAccess, baseName) || moduleAccess.push(baseName);
                Class = Class.getSuperclass();
            } while (isClass(Class));

            return moduleAccess;
        }
    });

    return Access;
});
