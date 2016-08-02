// Example for an Interface
JARS.module('lang.I$Iterable').$import('.Interface').$export(function(Interface) {
    'use strict';

    var I$Iterable = new Interface('Iterable', [
        ['iterator', 0]
    ]);

    return I$Iterable;
});
