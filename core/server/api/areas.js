// # Area API
// RESTful API for the Area resource
var Promise      = require('bluebird'),
    _            = require('lodash'),
    dataProvider = require('../models'),
    errors       = require('../errors'),
    utils        = require('./utils'),
    pipeline     = require('../utils/pipeline'),
    i18n         = require('../i18n'),

    docName      = 'areas',
    allowedIncludes = ['count.posts', 'count.areas', 'parent'],
    areas;

/**
 * ### Areas API Methods
 *
 * **See:** [API Methods](index.js.html#api%20methods)
 */
areas = {
    /**
     * ## Browse
     * @param {{context}} options
     * @returns {Promise<Areas>} Areas Collection
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
            // options.filter = 'id:-1';
            return dataProvider.Area.findPage(options);
        }

        // Push all of our tasks into a `tasks` array in the correct order
        tasks = [
            utils.validate(docName, {opts: utils.browseDefaultOptions}),
            utils.handlePublicPermissions(docName, 'browse'),
            utils.convertOptions(allowedIncludes),
            doQuery
        ];

        // Pipeline calls each task passing the result of one to be the arguments for the next
        return pipeline(tasks, options).then(function formatResponse(result) {
            return result;
        });
    },

    /**
     * ## Read
     * @param {{id}} options
     * @return {Promise<Area>} Area
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
            options.filter = 'id:-1';
            return dataProvider.Area.findOne(options, _.omit(options, ['data']));
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
                return {areas: [result.toJSON(options)]};
            }

            return Promise.reject(new errors.NotFoundError({message: i18n.t('errors.api.areas.areaNotFound')}));
        });
    },

    /**
     * ## Add
     * @param {Area} object the area to create
     * @returns {Promise(Area)} Newly created Area
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
            return dataProvider.Area.add(options.data.areas[0], _.omit(options, ['data']));
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
            var area = result.toJSON(options);

            return {areas: [area]};
        });
    },

    /**
     * ## Edit
     *
     * @public
     * @param {Area} object Area or specific properties to update
     * @param {{id, context, include}} options
     * @return {Promise<Area>} Edited Area
     */
    edit: function edit(object, options) {
        var tasks;

        /**
         * Make the call to the Model layer
         * @param {Object} options
         * @returns {Object} options
         */
        function doQuery(options) {
            return dataProvider.Area.edit(options.data.areas[0], _.omit(options, ['data']));
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
                var area = result.toJSON(options);

                return {areas: [area]};
            }

            return Promise.reject(new errors.NotFoundError({message: i18n.t('errors.api.areas.areaNotFound')}));
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
         * ### Delete Area
         * Make the call to the Model layer
         * @param {Object} options
         */
        function deleteArea(options) {
            return dataProvider.Area.destroy(options).return(null);
        }

        // Push all of our tasks into a `tasks` array in the correct order
        tasks = [
            utils.validate(docName, {opts: utils.idDefaultOptions}),
            utils.handlePermissions(docName, 'destroy'),
            utils.convertOptions(allowedIncludes),
            deleteArea
        ];

        // Pipeline calls each task passing the result of one to be the arguments for the next
        return pipeline(tasks, options);
    }
};

module.exports = areas;
