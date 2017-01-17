// # Categories Helper
// Usage: `{{categories}}`, `{{categories separator=' - '}}`
//
// Returns a string of the categories on the post.
// By default, categories are separated by commas.
//
// Note that the standard {{#each categories}} implementation is unaffected by this helper

var hbs             = require('express-hbs'),
    _               = require('lodash'),
    utils           = require('../utils'),
    localUtils      = require('./utils'),
    visibilityFilter = require('../utils/visibility-filter'),
    categories;

categories = function (options) {
    options = options || {};
    options.hash = options.hash || {};

    var autolink   = !(_.isString(options.hash.autolink) && options.hash.autolink === 'false'),
        separator  = _.isString(options.hash.separator) ? options.hash.separator : ', ',
        prefix     = _.isString(options.hash.prefix) ? options.hash.prefix : '',
        suffix     = _.isString(options.hash.suffix) ? options.hash.suffix : '',
        limit      = options.hash.limit ? parseInt(options.hash.limit, 10) : undefined,
        from       = options.hash.from ? parseInt(options.hash.from, 10) : 1,
        to         = options.hash.to ? parseInt(options.hash.to, 10) : undefined,
        visibility = localUtils.parseVisibility(options),
        output     = '';

    function createCategoryList(categories) {
        function processCategory(category) {
            return autolink ? localUtils.linkTemplate({
                url: utils.url.urlFor('category', {category: category}),
                text: _.escape(category.name)
            }) : _.escape(category.name);
        }

        return visibilityFilter(categories, visibility, !!options.hash.visibility, processCategory);
    }

    if (this.categories && this.categories.length) {
        output = createCategoryList(this.categories);
        from -= 1; // From uses 1-indexed, but array uses 0-indexed.
        to = to || limit + from || output.length;
        output = output.slice(from, to).join(separator);
    }

    if (output) {
        output = prefix + output + suffix;
    }

    return new hbs.handlebars.SafeString(output);
};

module.exports = categories;
