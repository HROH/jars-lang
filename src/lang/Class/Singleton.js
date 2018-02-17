JARS.module('lang.Class.Singleton').$import(['lang.Type.ClassMap', 'lang.Constant']).$export(function(ClassMap, Constant) {
    'use strict';

    var ClassFactory = this,
        SINGLETON = 'singleton',
        classMap = ClassMap.withKey(SINGLETON, Constant(null));

    ClassFactory.addStaticMethods({
        singleton: function() {
            return classMap.get(this, SINGLETON);
        },
        /**
         * @return {boolean} whether this Class has a singleton
         */
        hasSingleton: function() {
            return !!this.singleton();
        },

        createSingletonSubclass: function(name, proto, staticProperties, args) {
            return toSingleton(ClassFactory(name, proto, staticProperties, args).extendz(this));
        }
    });

    function toSingleton(Class, args) {
        classMap.set(Class, SINGLETON, Class.New(args));

        return Class;
    }

    function Singleton(name, proto, staticProperties, args) {
        return toSingleton(ClassFactory(name, proto, staticProperties), args);
    }

    ClassFactory.isNewableWhen(function(Class) {
        return !Class.hasSingleton();
    }, function(Class) {
        return Class.singleton();
    }, 'You can\'t create a new instance of a Singleton.');

    return Singleton;
});
