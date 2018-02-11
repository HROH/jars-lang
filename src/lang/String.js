JARS.module('lang.String', ['Camelizer']).$import([{
    System: ['::isA', '::isString']
}, '.Type!String']).$export(function(isA, isString, Str) {
    'use strict';

    var RE_CAPITAL_LETTER = /([A-Z])/g;

    /**
     * Extend lang.String with some useful methods
     * If a native implementation exists it will be used instead
     */
    Str.enhance({
        capitalize: function() {
            return fromString(this.charAt(0).toUpperCase() + this.substr(1));
        },

        dashify: function() {
            return fromString(this.replace(RE_CAPITAL_LETTER, dashifier));
        },

        startsWith: function(start) {
            return new RegExp('^' + start).test(this);
        },

        endsWith: function(end) {
            return new RegExp(end + '$').test(this);
        }
    }, {
        from: fromString,

        fromNative: fromString
    });

    // TODO
    // bug in chrome?: new StringCopy() sometimes can't access added methods
    // solved temporary by using StringCopy.fromNative() with while-loop
    // search for course/better solution
    function fromString(string) {
        string = string || '';

        if (isString(string)) {
            while (!isA(string, Str)) {
                string = new Str(string);
            }
        }

        return string;
    }

    function dashifier(match) {
        return '-' + match.toLowerCase();
    }

    return Str;
});
