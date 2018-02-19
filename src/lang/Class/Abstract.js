JARS.module('lang.Class.Abstract').$import(['lang.Type.ClassMap', 'lang.Constant::FALSE']).$export(function(ClassMap, FALSE) {
    'use strict';

    var ClassFactory = this,
        IS_ABSTRACT = 'isAbstract',
        classMap = ClassMap.withKey(IS_ABSTRACT, FALSE);

    ClassFactory.addStaticMethods({
        /**
         * @return {Boolean} whether this Class is an abstract Class
         */
        isAbstract: function() {
            return classMap.get(this, IS_ABSTRACT);
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
        classMap.set(Class, IS_ABSTRACT, true);

        return Class;
    }

    // If Class is an abstract Class return an empty Object
    // Returning undefined won't work because of the function behaviour in combination with 'new'
    ClassFactory.isNewableWhen(function(Class) {
        return !Class.isAbstract();
    }, function() {
        return {};
    }, 'You can\'t create a new instance of an abstract Class.');

    ClassFactory.isExtendableWhen(function(Class, Superclass) {
        return !Class.isAbstract() || Superclass.isAbstract();
    }, 'The given Superclass: "${superclass}" is not abstract and can\'t be extended by an abstract Class!');

    function Abstract(name, proto, staticProperties) {
        return toAbstract(ClassFactory(name, proto, staticProperties));
    }

    Abstract.abstractMethod = function(methodName) {
        return function abstractMethod() {
            this.Class.logger.error('Override ${0}()!', [methodName]);
        };
    };

    return Abstract;
});
