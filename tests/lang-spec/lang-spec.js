JARS.module('lang-spec').$import('lang').$export(function(lang) {
    'use strict';

    var expect = chai.expect;

    describe('lang', function() {
        it('should be an object', function() {
            expect(lang).to.be.an('object');
        });
    });
});
