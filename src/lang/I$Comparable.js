// Example for an Interface
JARS.module('lang.I$Comparable').$import('.Interface').$export(function(Interface) {
    'use strict';

    var I$Comparable = new Interface('Comparable', [
        ['compareTo', 1]
    ]);

    return I$Comparable;
});
