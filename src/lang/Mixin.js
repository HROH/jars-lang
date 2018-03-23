JARS.module('lang.Mixin').$import(['System::isArray', '.ObjectMixin', '.Object.Extend::extend', '.Function.Modargs::partial', {
    '.Array': ['Iterate::each', 'Derive::filter', 'Check::every'],
    '.Class': ['.', '::isClass', '::isInstance']
}]).$export(function(isArray, ObjectMixin, extend, partial, each, filter, every, Class, isClass, isInstance) {
    'use strict';

    var MSG_RECEIVER_TYPE_MISMATCH = 'The given receiver "${receiver}" is not part or instance of the allowed Classes!',
        Mixin;

    Mixin = Class('Mixin', {
        $: {
            construct: function(mixinName, toMix, options) {
                this.$super(mixinName, toMix, options);

                options = options || {};

                this._$allowedClasses = filterClasses(options.classes);
                this._$destructor = options.destructor;
            },

            canMixin: function(receiver) {
                var canMixin = this.$super(receiver);

                if(canMixin) {
                    canMixin = every(this._$allowedClasses, partial(isReceiverAllowed, receiver));

                    if(!canMixin) {
                        this._$logger.warn(MSG_RECEIVER_TYPE_MISMATCH, {
                            receiver: isClass(receiver) || isInstance(receiver) ? receiver.getHash() : receiver
                        });
                    }
                }

                return canMixin;
            },

            mixInto: function(receiver) {
                var destructor = this._$destructor,
                    objectToExtend;

                if (this.canMixin(receiver)) {
                    this._$prepareMixin(receiver);

                    if (isClass(receiver)) {
                        objectToExtend = receiver.prototype;
                        receiver.addDestructor(destructor);
                    }
                    else {
                        objectToExtend = receiver;

                        if (isInstance(receiver)) {
                            receiver.Class.addDestructor(destructor, receiver);
                        }
                    }

                    extend(objectToExtend, this._$toMix);
                }

                return receiver;
            }
        },

        _$: {
            allowedClasses: null,

            destructor: null
        }
    }).extendz(ObjectMixin);

    function isReceiverAllowed(receiver, allowedClass) {
        return receiver === allowedClass || allowedClass.isSuperclassOf(receiver) || allowedClass.isInstance(receiver);
    }

    function filterClasses(classes) {
        return filter(isArray(classes) ? classes : [classes], isClass);
    }

    /**
     * Define a mixin-method that mixes the Mixin into the Class
     * It is available for every Class created with lang.Class()
     * as soon as this module is loaded
     */
    Class.addStaticMethod('mixin', function() {
        var Class = this;

        each(filter(arguments, Mixin.isInstance, Mixin), function(mixin) {
            mixin.mixInto(Class);
        });

        return Class;
    });

    return Mixin;
});
