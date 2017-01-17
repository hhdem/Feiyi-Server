// # Areas Helper
// Usage: `{{areas}}`, `{{areas separator=' - '}}`
//
// Returns a string of the areas on the post.
// By default, areas are separated by commas.
//
// Note that the standard {{#each areas}} implementation is unaffected by this helper

var hbs             = require('express-hbs'),
    _               = require('lodash'),
    utils           = require('../utils'),
    localUtils      = require('./utils'),
    visibilityFilter = require('../utils/visibility-filter'),
    areas;

areas = function (options) {
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

    function createAreaList(areas) {
        function processArea(area) {
            return autolink ? localUtils.linkTemplate({
                url: utils.url.urlFor('area', {area: area}),
                text: _.escape(area.name)
            }) : _.escape(area.name);
        }

        return visibilityFilter(areas, visibility, !!options.hash.visibility, processArea);
    }

    if (this.areas && this.areas.length) {
        output = createAreaList(this.areas);
        from -= 1; // From uses 1-indexed, but array uses 0-indexed.
        to = to || limit + from || output.length;
        output = output.slice(from, to).join(separator);
    }

    if (output) {
        output = prefix + output + suffix;
    }

    return new hbs.handlebars.SafeString(output);
};

module.exports = areas;
