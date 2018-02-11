JARS.module('lang.Class.Abstract').$import('lang.Type.Class::onRemoved').$export(function(onClassRemoved) {
    'use strict';

    var ClassFactory = this,
        classesIsAbstract = {};

    ClassFactory.addStaticMethods({
        /**
         * @return {Boolean} whether this Class is an abstract Class
         */
        isAbstract: function() {
            return classesIsAbstract[this.getHash()] || false;
        },
        /**
         *
         *
         * @param {String} name
         * @param {Object} proto
         * @param {Object} staticProperties
         *
         * @return {(Class|undefined)}
         */
        createAbstractSubclass: function(name, proto, staticProperties) {
            return Abstract(name, proto, staticProperties).extendz(this);
        }
    });

    /**
     *
     * @param {Class}
     *
     * @return {Class} a reference to this Class for chaining
     */
    function toAbstract(Class) {
        classesIsAbstract[Class.getHash()] = true;

        return Class;
    }

    // If Class is an abstract Class return an empty Object
    // Returning undefined won't work because of the function behaviour in combination with 'new'
    ClassFactory.isNewableWhen(function(Class) {
        return !Class.isAbstract();
    }, function() {
        return {};
    }, 'You can\'t create a new instance of an abstract Class.');

    ClassFactory.isExtendableWhen(function(data) {
        return !data.Class.isAbstract() || data.Superclass.isAbstract();
    }, 'The given Superclass: "${superclassHash}" is not abstract and can\'t be extended by an abstract Class!');

    function Abstract(name, proto, staticProperties) {
        return toAbstract(ClassFactory(name, proto, staticProperties));
    }

    Abstract.abstractMethod = function(methodName) {
        return function abstractMethod() {
            this.Class.logger.error('Override ${0}()!', [methodName]);
        };
    };

    onClassRemoved(function(Class) {
        if(Class.isAbstract()) {
            delete classesIsAbstract[Class.getHash()];
        }
    });

    return Abstract;
});
