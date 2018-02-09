JARS.module('lang.String.Camelizer').$import(['.::enhance', '.::from', '.::capitalize', {
    '..Array': ['.::fromArguments', 'Reduce::reduce']
}]).$export(function(enhance, fromString, capitalize, fromArguments, reduce) {
    'use strict';

    function buildCamelized(startString, nextString) {
        return startString ? startString + (nextString ? capitalize(nextString) : '') : nextString;
    }

    return enhance({
        camelize: function() {
            return fromString(reduce(this.split('-').concat(fromArguments(arguments)), buildCamelized, ''));
        }
    });
});
