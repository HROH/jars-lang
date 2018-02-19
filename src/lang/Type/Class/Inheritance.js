JARS.module('lang.Type.Class.Inheritance').$import(['System::isA', '.::enhance', '.::is', '.::addWithSuperclass', '..ClassMap', '.ExtendedPrototypeBuilder', {
    lang: ['Object.Reduce::reduce', 'Array.Find::find', 'Function::negate', 'operations.Comparison::nseq']
}]).$export(function(isA, enhance, isClass, addClassWithSuperclass, ClassMap, ExtendedPrototypeBuilder, reduce, find, negate, nseq) {
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
    function isExtendableWhen(predicate, message, getData) {
        extensionPredicates.push({
            predicate: predicate,

            message: message,

            getData: getData || getDefaultData
        });
    }
    
    function getDefaultData(Class, Superclass) {
        return {
            superclass: Superclass.getHash()
        };
    }

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
                foundFail = find(extensionPredicates, function(predicateData) {
                    return !predicateData.predicate(Class, Superclass);
                });

            if (foundFail) {
                Class.logger.error(MSG_NO_EXTEND + foundFail.message, foundFail.getData(Class, Superclass));
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

    isExtendableWhen(function(Class, Superclass) {
        return isClass(Superclass);
    }, 'There is no Superclass given!');

    isExtendableWhen(nseq, 'The Class can\'t extend itself!');

    isExtendableWhen(negate(Inheritance.hasSuperclass), 'The Class already has the Superclass: "${superclass}"!', function(Class) {
        return {
            superclass: Class.getSuperclass().getHash()
        };
    });

    isExtendableWhen(function(Class) {
        return !Class.getInstances().length && !Class.hasSubclasses();
    }, 'The Class already has instances or Subclasses!');

    isExtendableWhen(function(Class, Superclass) {
        return !Superclass.isSubclassOf(Class);
    }, 'The given Superclass: "${superclass}" is already inheriting from this Class!');

    return Inheritance;
});
