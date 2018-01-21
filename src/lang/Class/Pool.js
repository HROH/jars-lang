JARS.module('lang.Class.Pool').$import('..Object!Info').$export(function(Obj) {
    'use strict';

    var Class = this,
        Pool;

    Pool = Class('Pool', {
        $: {
            construct: function(options) {
                var pool = this;

                pool._$options = Obj.extend(options || {}, Pool.DEFAULTS);

                pool._$freeInstances = [];
                pool._$reservedInstances = {};

                pool._$fillPool(options.size);
            },

            release: function(instance) {
                var PoolClass = this._$options.Class;

                if (PoolClass.isInstance(instance) && Obj.hasOwn(this._$reservedInstances, instance.getHash())) {
                    delete this._$reservedInstances[instance.getHash()];

                    PoolClass.destruct(instance);

                    if (Obj.size(this._$reservedInstances) + this._$freeInstances.length < this._$poolSize) {
                        delete instance.getHash;
                        PoolClass.NewBare(instance);

                        this._$freeInstances.push(instance);
                    }
                }
            },

            borrow: function() {
                var poolExhausted = !this.getAvailablePoolSize(),
                    instance;

                if (poolExhausted && this._$options.autoAdjust) {
                    this.adjustPoolSize(this._$poolSize * this._$options.autoAdjustFaktor);
                    poolExhausted = false;
                }

                if (!poolExhausted) {
                    instance = this._$freeInstances.pop();

                    if (arguments.length) {
                        instance.construct.apply(instance, arguments);
                    }

                    this._$reservedInstances[instance.getHash()] = instance;
                }
                else {
                    this.Class.logger.warn('Pool exhausted');
                }

                return instance;
            },

            getPoolSize: function() {
                return this._$poolSize;
            },

            getAvailablePoolSize: function() {
                return this._$freeInstances.length;
            },

            adjustPoolSize: function(newSize) {
                var sizeDiff = newSize - this._$poolSize;

                if (sizeDiff) {
                    if (sizeDiff > 0) {
                        this._$fillPool(sizeDiff);
                    }
                    else if (this._$freeInstances.length + sizeDiff >= 0) {
                        this._$freeInstances.length += sizeDiff;
                    }
                    else {
                        this.Class.logger.warn('Can\'t adjust poolsize for the class ${hash}. Not enough free instances available.', {
                            hash: this._$options.Class.getHash()
                        });
                    }
                }
            }
        },

        _$: {
            options: null,

            poolSize: 0,

            freeInstances: null,

            reservedInstances: null,

            fillPool: function(count) {
                var PoolClass = this._$options.Class;

                this._$poolSize += count;

                while (count--) {
                    this._$freeInstances.push(PoolClass.NewBare());
                }
            }
        }
    }, {
        DEFAULTS: {
            autoAdjust: false,

            autoAdjustFactor: 2,

            size: 1
        }
    });

    return Pool;
});
