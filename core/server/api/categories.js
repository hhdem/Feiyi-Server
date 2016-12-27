// # Category API
// RESTful API for the Category resource
var Promise      = require('bluebird'),
    _            = require('lodash'),
    dataProvider = require('../models'),
    errors       = require('../errors'),
    utils        = require('./utils'),
    pipeline     = require('../utils/pipeline'),
    i18n         = require('../i18n'),

    docName      = 'categories',
    allowedIncludes = ['count.posts'],
    categories;

/**
 * ### Categorys API Methods
 *
 * **See:** [API Methods](index.js.html#api%20methods)
 */
categories = {
    /**
     * ## Browse
     * @param {{context}} options
     * @returns {Promise<Categorys>} Categorys Collection
     */
    browse: function browse(options) {
        var tasks;

        /**
         * ### Model Query
         * Make the call to the Model layer
         * @param {Object} options
         * @returns {Object} options
         */
        function doQuery(options) {
            return dataProvider.Category.findPage(options);
        }

        // Push all of our tasks into a `tasks` array in the correct order
        tasks = [
            utils.validate(docName, {opts: utils.browseDefaultOptions}),
            utils.handlePublicPermissions(docName, 'browse'),
            utils.convertOptions(allowedIncludes),
            doQuery
        ];

        // Pipeline calls each task passing the result of one to be the arguments for the next
        return pipeline(tasks, options);
    },

    /**
     * ## Read
     * @param {{id}} options
     * @return {Promise<Category>} Category
     */
    read: function read(options) {
        var attrs = ['id', 'slug', 'visibility'],
            tasks;

        /**
         * ### Model Query
         * Make the call to the Model layer
         * @param {Object} options
         * @returns {Object} options
         */
        function doQuery(options) {
            return dataProvider.Category.findOne(options.data, _.omit(options, ['data']));
        }

        // Push all of our tasks into a `tasks` array in the correct order
        tasks = [
            utils.validate(docName, {attrs: attrs}),
            utils.handlePublicPermissions(docName, 'read'),
            utils.convertOptions(allowedIncludes),
            doQuery
        ];

        // Pipeline calls each task passing the result of one to be the arguments for the next
        return pipeline(tasks, options).then(function formatResponse(result) {
            if (result) {
                return {categories: [result.toJSON(options)]};
            }

            return Promise.reject(new errors.NotFoundError({message: i18n.t('errors.api.categories.tagNotFound')}));
        });
    },

    /**
     * ## Add
     * @param {Category} object the tag to create
     * @returns {Promise(Category)} Newly created Category
     */
    add: function add(object, options) {
        var tasks;

        /**
         * ### Model Query
         * Make the call to the Model layer
         * @param {Object} options
         * @returns {Object} options
         */
        function doQuery(options) {
            return dataProvider.Category.add(options.data.categories[0], _.omit(options, ['data']));
        }

        // Push all of our tasks into a `tasks` array in the correct order
        tasks = [
            utils.validate(docName),
            utils.handlePermissions(docName, 'add'),
            utils.convertOptions(allowedIncludes),
            doQuery
        ];

        // Pipeline calls each task passing the result of one to be the arguments for the next
        return pipeline(tasks, object, options).then(function formatResponse(result) {
            var tag = result.toJSON(options);

            return {categories: [tag]};
        });
    },

    /**
     * ## Edit
     *
     * @public
     * @param {Category} object Category or specific properties to update
     * @param {{id, context, include}} options
     * @return {Promise<Category>} Edited Category
     */
    edit: function edit(object, options) {
        var tasks;

        /**
         * Make the call to the Model layer
         * @param {Object} options
         * @returns {Object} options
         */
        function doQuery(options) {
            return dataProvider.Category.edit(options.data.categories[0], _.omit(options, ['data']));
        }

        // Push all of our tasks into a `tasks` array in the correct order
        tasks = [
            utils.validate(docName, {opts: utils.idDefaultOptions}),
            utils.handlePermissions(docName, 'edit'),
            utils.convertOptions(allowedIncludes),
            doQuery
        ];

        // Pipeline calls each task passing the result of one to be the arguments for the next
        return pipeline(tasks, object, options).then(function formatResponse(result) {
            if (result) {
                var tag = result.toJSON(options);

                return {categories: [tag]};
            }

            return Promise.reject(new errors.NotFoundError({message: i18n.t('errors.api.categories.tagNotFound')}));
        });
    },

    /**
     * ## Destroy
     *
     * @public
     * @param {{id, context}} options
     * @return {Promise}
     */
    destroy: function destroy(options) {
        var tasks;

        /**
         * ### Delete Category
         * Make the call to the Model layer
         * @param {Object} options
         */
        function deleteCategory(options) {
            return dataProvider.Category.destroy(options).return(null);
        }

        // Push all of our tasks into a `tasks` array in the correct order
        tasks = [
            utils.validate(docName, {opts: utils.idDefaultOptions}),
            utils.handlePermissions(docName, 'destroy'),
            utils.convertOptions(allowedIncludes),
            deleteCategory
        ];

        // Pipeline calls each task passing the result of one to be the arguments for the next
        return pipeline(tasks, options);
    }
};

module.exports = categories;
