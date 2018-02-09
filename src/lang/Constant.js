JARS.module('lang.Constant').$import({
    '.Function': ['::identity', 'Modargs::partial']
}).$export(function(identity, partial) {
    'use strict';

    /**
     * @function
     *
     * @memberof module:lang
     *
     * @param {*} value
     *
     * @return {function}
     */
    var Constant = partial(partial, identity);

    /**
     * @function
     *
     * @memberof module:lang.Constant
     *
     * @return {boolean}
     */
    Constant.TRUE = Constant(true);
    Constant.FALSE = Constant(false);

    return Constant;
});
