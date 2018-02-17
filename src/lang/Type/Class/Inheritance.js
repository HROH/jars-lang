JARS.module('lang.Type.Class.Inheritance').$import(['System::isA', '.::enhance', '.::is', '.::addWithSuperclass', '..ClassMap', '.ExtendedPrototypeBuilder', {
    lang: ['Object.Reduce::reduce', 'Array.Find::find']
}]).$export(function(isA, enhance, isClass, addClassWithSuperclass, ClassMap, ExtendedPrototypeBuilder, reduce, find) {
    'use strict';

    var extensionPredicates = [],
        SUPERCLASS = 'superclass',
        SUBClASSES = 'subclasses',
        classMap = new ClassMap({
            onAdded: function() {
                return {
                    superclass: null,
        
                    subclasses: {}
                };
            },

            onRemoved: function(Class) {
                var Superclass = classMap.get(Class, SUPERCLASS);

                if(Superclass) {
                    delete classMap.get(Superclass, SUBClASSES)[Class.getHash()];
                }
            }
        }),
        MSG_NO_EXTEND = 'The Class can\'t be extended! ',
        Inheritance;

    /**
     * @param {function(Class):Boolean} predicate
     * @param {String} message
     */
    function isExtendableWhen(predicate, message) {
        extensionPredicates.push({
            predicate: predicate,

            message: message
        });
    }

    isExtendableWhen(function superclassIsGiven(data) {
        return isClass(data.Superclass);
    }, 'There is no Superclass given!');

    isExtendableWhen(function superclassIsNotSelf(data) {
        return data.Superclass !== data.Class;
    }, 'The Class can\'t extend itself!');

    isExtendableWhen(function classHasNoSuperclass(data) {
        var hasNoSuperclass = !data.Class.hasSuperclass();

        hasNoSuperclass || (data.Superclass = data.Class.getSuperclass());

        return hasNoSuperclass;
    }, 'The Class already has the Superclass: "${superclassHash}"!');

    isExtendableWhen(function classHasNoInstancesAndSubclasses(data) {
        return !data.Class.getInstances().length && !data.Class.hasSubclasses();
    }, 'The Class already has instances or Subclasses!');

    isExtendableWhen(function superclassIsNoSubclassOfClass(data) {
        return !data.Superclass.isSubclassOf(data.Class);
    }, 'The given Superclass: "${superclassHash}" is already inheriting from this Class!');

    Inheritance = enhance({
        /**
         * @return {Class} the Superclass of this Class
         */
        getSuperclass: function() {
            return classMap.get(this, SUPERCLASS);
        },
        /**
         * @return {Array.<Class>} an array of all Subclasses
         */
        getSubclasses: function(includeSubclasses) {
            return reduce(classMap.get(this, SUBClASSES), function(subclasses, Subclass) {
                subclasses.push(Subclass);

                return includeSubclasses ? subclasses.concat(Subclass.getSubclasses(true)) : subclasses;
            }, []);
        },
        /**
         * @return {boolean}
         */
        hasSuperclass: function() {
            return !!this.getSuperclass();
        },
        /**
         * @return {boolean}
         */
        hasSubclasses: function() {
            return this.getSubclasses().length > 0;
        },
        /**
         * @param {Class} Superclass
         *
         * @return {boolean}
         */
        isSubclassOf: function(Superclass) {
            return isClass(Superclass) && isA(this.prototype, Superclass);
        },
        /**
         * @param {Class} Superclass
         *
         * @return {boolean}
         */
        isSuperclassOf: function(Subclass) {
            return isClass(Subclass) && isA(Subclass.prototype, this);
        },
        /**
         * @param {Class} Class
         *
         * @return {boolean}
         */
        isOf: function(Class) {
            return this === Class || this.isSubclassOf(Class);
        },
        /**
         * @param {Class} Superclass
         *
         * @return {Class}
         */
        extendz: function(Superclass, proto, staticProperties) {
            var Class = this,
                data = {
                    Class: Class,
                    Superclass: Superclass
                },
                foundFail = find(extensionPredicates, function(predicateData) {
                    return !predicateData.predicate(data);
                });

            if (foundFail) {
                Class.logger.error(MSG_NO_EXTEND + foundFail.message, {
                    superclassHash: data.Superclass.getHash()
                });
            }
            else {
                addClassWithSuperclass(Class, Superclass, new ExtendedPrototypeBuilder(proto), staticProperties);

                classMap.set(Class, SUPERCLASS, Superclass);
                classMap.get(Superclass, SUBClASSES)[Class.getHash()] = Class;
            }

            return Class;
        }
    });

    Inheritance.isExtendableWhen = isExtendableWhen;

    return Inheritance;
});
