'use strict';

const context = {};

module.exports = {
    set: (name, value) => {
        if (typeof name === 'string' && name) {
            context[name] = value;
        }
    },

    get: name => {
        return context[name];
    },

    toString: () => {
        return JSON.stringify(context);
    }
};