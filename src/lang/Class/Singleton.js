JARS.module('lang.Class.Singleton').$import('lang.Type.Class::onRemoved').$export(function(onClassRemoved) {
    'use strict';

    var ClassFactory = this,
        classesSingleton = {};

    ClassFactory.addStaticMethods({
        singleton: function() {
            return classesSingleton[this.getHash()];
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
        classesSingleton[Class.getHash()] = Class.New(args);

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

    onClassRemoved(function(Class) {
        if(Class.hasSingleton()) {
            delete classesSingleton[Class.getHash()];
        }
    });

    return Singleton;
});
