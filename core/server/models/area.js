var _              = require('lodash'),
    ghostBookshelf = require('./base'),
    events         = require('../events'),
    Area,
    Areas;

Area = ghostBookshelf.Model.extend({

    tableName: 'areas',

    emitChange: function emitChange(event) {
        events.emit('area' + '.' + event, this);
    },

    onCreated: function onCreated(model) {
        model.emitChange('added');
    },

    onUpdated: function onUpdated(model) {
        model.emitChange('edited');
    },

    onDestroyed: function onDestroyed(model) {
        model.emitChange('deleted');
    },

    onSaving: function onSaving(newPage, attr, options) {
        /*jshint unused:false*/
        var self = this;

        ghostBookshelf.Model.prototype.onSaving.apply(this, arguments);

        if (this.hasChanged('slug') || !this.get('slug')) {
            // Pass the new slug through the generator to strip illegal characters, detect duplicates
            return ghostBookshelf.Model.generateSlug(Area, this.get('slug') || this.get('name'),
                {transacting: options.transacting})
                .then(function then(slug) {
                    self.set({slug: slug});
                });
        }
    },

    posts: function posts() {
        return this.belongsToMany('Post');
    },

    areas: function areas() {
        return this.belongsToMany('Area');
    },

    // Relations
    parent: function parent() {
        return this.belongsTo('Area', 'parent_id');
    },

    defaultColumnsToFetch: function defaultColumnsToFetch() {
        return ['id', 'parent_id'];
    },

    toJSON: function toJSON(options) {
        options = options || {};

        var attrs = ghostBookshelf.Model.prototype.toJSON.call(this, options);

        attrs.parent = attrs.parent || attrs.parent_id;
        delete attrs.parent_id;

        return attrs;
    }
}, {
    orderDefaultOptions: function orderDefaultOptions() {
        return {};
    },

    /**
     * @deprecated in favour of filter
     */
    processOptions: function processOptions(options) {
        return options;
    },

    permittedOptions: function permittedOptions(methodName) {
        var options = ghostBookshelf.Model.permittedOptions(),

        // whitelists for the `options` hash argument on methods, by method name.
        // these are the only options that can be passed to Bookshelf / Knex.
            validOptions = {
                findPage: ['page', 'limit', 'columns', 'filter', 'order'],
                findAll: ['columns'],
                findOne: ['visibility']
            };

        if (validOptions[methodName]) {
            options = options.concat(validOptions[methodName]);
        }

        return options;
    },

    /**
     * ### Find One
     * @overrides ghostBookshelf.Model.findOne
     */
    findOne: function findOne(data, options) {
        options = options || {};

        options = this.filterOptions(options, 'findOne');
        data = this.filterData(data, 'findOne');

        var area = this.forge(data);

        // Add related objects
        options.withRelated = _.union(options.withRelated, options.include);

        return area.fetch(options);
    },

    destroy: function destroy(options) {
        var id = options.id;
        options = this.filterOptions(options, 'destroy');

        return this.forge({id: id}).fetch({withRelated: ['posts']}).then(function destroyAreasAndPost(area) {
            return area.related('posts').detach().then(function destroyAreas() {
                return area.destroy(options);
            });
        });
    },

    /**
     * Filters potentially unsafe model attributes, so you can pass them to Bookshelf / Knex.
     * @param {Object} data Has keys representing the model's attributes/fields in the database.
     * @return {Object} The filtered results of the passed in data, containing only what's allowed in the schema.
     */
    filterData: function filterData(data) {
        var permittedAttributes = this.prototype.permittedAttributes(),
            filteredData;

        // manually add 'parent' attribute since it's not in the schema
        permittedAttributes.push('parent');

        filteredData = _.pick(data, permittedAttributes);

        return filteredData;
    }

});

Areas = ghostBookshelf.Collection.extend({
    model: Area
});

module.exports = {
    Area: ghostBookshelf.model('Area', Area),
    Areas: ghostBookshelf.collection('Areas', Areas)
};
