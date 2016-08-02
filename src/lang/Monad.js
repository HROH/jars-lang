JARS.module('lang.Monad').$import('.Class.Abstract').$export(function(AbstractClass) {
    'use strict';

    var Monad = AbstractClass('Monad', {
        construct: AbstractClass.abstractMethod('construct'),

        toValue: AbstractClass.abstractMethod('toValue'),

        bind: AbstractClass.abstractMethod('bind')
    }, {
        unit: function(value) {
            var MonadClass = this;

            return new MonadClass(value);
        },

        lift: function(fn) {
            var MonadClass = this;

            return function(value) {
                return MonadClass.unit(fn(value));
            };
        }
    });

    return Monad;
});
