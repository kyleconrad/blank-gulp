'use strict';

var fs = require('fs');
var hashfile = require('hash-file');
var mkdir = require('mkdirp');
var path = require('path');
var rm = require('rimraf');
var tmp = require('os').tmpdir();

/**
 * Initialize `Cache`
 *
 * @param {String} src
 * @api private
 */

function Cache(src) {
    this.src = src;
    this.cache = path.join(tmp, hashfile(src));
}

/**
 * Cache a file
 *
 * @param {String} dest
 * @api public
 */

Cache.prototype.store = function (dest) {
    this.cache = dest ? path.join(tmp, hashfile(dest)) : this.cache;

    if (!fs.existsSync(this.cache)) {
        if (!fs.existsSync(path.dirname(this.cache))) {
            mkdir.sync(path.dirname(this.cache));
        }

        fs.createReadStream(this.src).pipe(fs.createWriteStream(this.cache));
    }
};

/**
 * Get a cached file
 *
 * @param {String} dest
 * @api public
 */

Cache.prototype.get = function (dest) {
    if (fs.existsSync(this.cache)) {
        if (!fs.existsSync(path.dirname(dest))) {
            mkdir.sync(path.dirname(dest));
        }

        fs.createReadStream(this.cache).pipe(fs.createWriteStream(dest));
    }
};

/**
 * Check if a file exists in cache
 *
 * @api public
 */

Cache.prototype.check = function () {
    if (fs.existsSync(this.cache)) {
        return true;
    }

    return false;
};

/**
 * Get the path to a cached file
 *
 * @api public
 */

Cache.prototype.path = function () {
    if (fs.existsSync(this.cache)) {
        return path.resolve(this.cache);
    }
};

/**
 * Clean cache
 *
 * @api public
 */

Cache.prototype.clean = function () {
    if (fs.existsSync(this.cache)) {
        rm.sync(this.cache);
    }
};

/**
 * Module exports
 */

module.exports.store = function (src, dest) {
    var cache = new Cache(src);
    return cache.store(dest);
};

module.exports.get = function (src, dest) {
    var cache = new Cache(src);
    return cache.get(dest);
};

module.exports.check = function (src) {
    var cache = new Cache(src);
    return cache.check();
};

module.exports.path = function (src) {
    var cache = new Cache(src);
    return cache.path();
};

module.exports.clean = function (src) {
    var cache = new Cache(src);
    return cache.clean();
};
