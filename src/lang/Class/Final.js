JARS.module('lang.Class.Final').$import('lang.Type.Class::onRemoved').$export(function(onClassRemoved) {
    'use strict';

    var ClassFactory = this,
        classesIsFinal = {};

    ClassFactory.addStaticMethods({
        /**
         * @return {Boolean} whether this Class is a final Class
         */
        isFinal: function() {
            return classesIsFinal[this.getHash()] || false;
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
        createFinalSubclass: function(name, proto, staticProperties) {
            return Final(name, proto, staticProperties).extendz(this);
        }
    });

    /**
     *
     * @param {Class}
     *
     * @return {Class} a reference to this Class for chaining
     */
    function toFinal(Class) {
        classesIsFinal[Class.getHash()] = true;

        return Class;
    }

    ClassFactory.isExtendableWhen(function(data) {
        return !data.Superclass.isFinal();
    }, 'The given Superclass: "${superclassHash}" is final and can\'t be extended!');

    onClassRemoved(function(Class) {
        if(Class.isFinal()) {
            delete classesIsFinal[Class.getHash()];
        }
    });

    function Final(name, proto, staticProperties) {
        return toFinal(ClassFactory(name, proto, staticProperties));
    }

    return Final;
});
