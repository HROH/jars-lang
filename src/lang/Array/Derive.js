JARS.module('lang.Array.Derive').$import(['.::enhance', 'lang.Type.Method.Array::withCallback']).$export(function(enhance, withCallback) {
    'use strict';

    return enhance({
        filter: withCallback('filter'),

        map: withCallback('map')
    });
});
