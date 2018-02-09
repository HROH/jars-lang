JARS.module('lang.ObjectMixin').$import([{
    System: ['Modules::getCurrentModuleData', '::isArray', 'Logger'],
    '.Array': ['Iterate::each', 'Derive::filter', 'Check::every']
}, '.Object.Extend::extend', '.Class']).$export(function(getCurrentModuleData, isArray, Logger, each, filter, every, extend, Class) {
    'use strict';

    var MSG_RECEIVER_MISSING = 'There is no receiver given!',
        ObjectMixin;

    ObjectMixin = Class('ObjectMixin', {
        $: {
            construct: function(mixinName, toMix, options) {
                options = options || {};

                this._$name = this.Class.getClassName() + ' #<' + getCurrentModuleData().moduleName + ':' + mixinName + '>';
                this._$toMix = toMix;
                this._$neededMixins = filter(options.depends || [], ObjectMixin.isInstance, ObjectMixin);
                this._$logger = new Logger(this._$name);
            },

            canMix: function(receiver) {
                var canMix = false;

                if(receiver) {
                    canMix = every(this._$neededMixins, function(mixin) {
                        return mixin.canMix(receiver);
                    });
                }
                else {
                    this._$logger.warn(MSG_RECEIVER_MISSING);
                }

                return canMix;
            },

            mixInto: function(receiver) {
                if (this.canMix(receiver)) {
                    this._$prepareMixin(receiver);
                    extend(receiver, this._$toMix);
                }

                return receiver;
            },

            getName: function() {
                return this._$name;
            }
        },

        _$: {
            name: '',

            logger: null,

            toMix: null,

            neededMixins: null,

            prepareMixin: function(receiver) {
                each(this._$neededMixins, function(mixin) {
                    mixin.mixInto(receiver);
                });
            }
        }
    });

    return ObjectMixin;
});
