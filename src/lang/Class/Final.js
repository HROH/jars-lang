JARS.module('lang.Class.Final').$import(['lang.Type.ClassMap', 'lang.Constant::FALSE']).$export(function(ClassMap, FALSE) {
    'use strict';

    var ClassFactory = this,
        IS_FINAL = 'isFinal',
        classMap = ClassMap.withKey(IS_FINAL, FALSE);

    ClassFactory.addStaticMethods({
        /**
         * @return {Boolean} whether this Class is a final Class
         */
        isFinal: function() {
            return classMap.get(this, IS_FINAL);
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
        classMap.set(Class, IS_FINAL, true);

        return Class;
    }

    ClassFactory.isExtendableWhen(function(data) {
        return !data.Superclass.isFinal();
    }, 'The given Superclass: "${superclassHash}" is final and can\'t be extended!');

    function Final(name, proto, staticProperties) {
        return toFinal(ClassFactory(name, proto, staticProperties));
    }

    return Final;
});
