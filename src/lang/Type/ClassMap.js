JARS.module('lang.Type.ClassMap').$import(['lang.Array.Iterate::each', 'lang.Object.Extend::extend', 'lang.Function.Modargs::partial']).$export(function(arrayEach, extend, partial) {
    'use strict';

    var addClassListener = [],
        removeClassListener = [],
        addInstanceListener = [],
        removeInstanceListener = [],
        INSTANCES = 'instances';

    function ClassMap(options) {
        var classMap = this;

        classMap._classes = {};

        options = options || {};

        addClassListener.push(function(Class) {
            classMap.add(Class, options.onAdded(Class));
            options.onInstanceAdded && classMap.set(Class, INSTANCES, {});
        });

        removeClassListener.push(function(Class) {
            options.onRemoved && options.onRemoved(Class);

            classMap.remove(Class);
        });

        if(options.onInstanceAdded) {
            addInstanceListener.push(function(instance) {
                classMap.addInstance(instance, options.onInstanceAdded(instance));
            });

            removeInstanceListener.push(function(instance) {
                options.onInstanceRemoved && options.onInstanceRemoved(instance);

                classMap.removeInstance(instance);
            });
        }
        else if(options.onInstanceRemoved) {
            removeInstanceListener.push(function(instance) {
                options.onInstanceRemoved(instance);
            });
        }
    }

    ClassMap.prototype = {
        constructor: ClassMap,

        add: function(Class, props) {
            this._classes[Class.getHash()] = props;
        },

        hasHash: function(ClassHash) {
            return !!this._classes[ClassHash];
        },

        addInstance: function(instance, value) {
            this.getInstances(instance.Class)[instance.getHash()] = value;
        },

        remove: function(Class) {
            delete this._classes[Class.getHash()];
        },

        removeInstance: function(instance) {
            delete this.getInstances(instance.Class)[instance.getHash()];
        },

        set: function(Class, key, value) {
            this._classes[Class.getHash()][key] = value;
        },

        get: function(Class, key) {
            return this._classes[Class.getHash()][key];
        },

        getInstance: function(instance) {
            return this.getInstances(instance.Class)[instance.getHash()];
        },

        getInstances: function(Class) {
            return this.get(Class, INSTANCES);
        }
    };

    ClassMap.add = partial(callListeners, addClassListener);

    ClassMap.remove = partial(callListeners, removeClassListener);

    ClassMap.addInstance = partial(callListeners, addInstanceListener);

    ClassMap.removeInstance = partial(callListeners, removeInstanceListener);

    ClassMap.withKey = function(key, getValue, options) {
        return new ClassMap(extend(options || {}, {
            onAdded: function(Class) {
                var data = {};

                data[key] = getValue(Class);

                return data;
            }
        }));
    };

    function callListeners(listeners, instanceOrClass) {
        arrayEach(listeners, function(listener) {
            listener(instanceOrClass);
        });
    }

    return ClassMap;
});
