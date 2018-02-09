JARS.module('lang.Type.Class.Module').$import(['System.Modules::use', '.::enhance']).$export(function(use, enhance) {
    'use strict';

    var Module = {
        getName: function(Class) {
            return Class.getModuleName();
        },

        getBaseName: function(Class) {
            return Class.getModuleBaseName();
        },

        get: function(Class) {
            return Class.getModule();
        },

        getBase: function(Class) {
            return Class.getModuleBase();
        }
    };

    enhance({
        getModuleBaseName: function() {
            var Class = this,
                moduleName = Class.getModuleName();

            return (use(moduleName) === Class) ? moduleName.substring(0, moduleName.lastIndexOf('.')) || moduleName : moduleName;
        },

        getModule: function() {
            return use(this.getModuleName());
        },

        getModuleBase: function() {
            return use(this.getModuleBaseName());
        }
    });

    return Module;
});
