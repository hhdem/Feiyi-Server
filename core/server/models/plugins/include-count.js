var _ = require('lodash');

module.exports = function (Bookshelf) {
    var modelProto = Bookshelf.Model.prototype,
        Model,
        countQueryBuilder;

    countQueryBuilder = {
        tags: {
            posts: function addPostCountToTags(model) {
                model.query('columns', 'tags.*', function (qb) {
                    qb.count('posts.id')
                        .from('posts')
                        .leftOuterJoin('posts_tags', 'posts.id', 'posts_tags.post_id')
                        .whereRaw('posts_tags.tag_id = tags.id')
                        .as('count__posts');

                    if (model.isPublicContext()) {
                        // @TODO use the filter behavior for posts
                        qb.andWhere('posts.page', '=', false);
                        qb.andWhere('posts.status', '=', 'published');
                    }
                });
            }
        },
        categories: {
            posts: function addPostCountToTags(model) {
                model.query('columns', 'categories.*', function (qb) {
                    qb.count('posts.id')
                        .from('posts')
                        .leftOuterJoin('posts_categories', 'posts.id', 'posts_categories.post_id')
                        .whereRaw('posts_categories.category_id = categories.id')
                        .as('count__posts');

                    if (model.isPublicContext()) {
                        // @TODO use the filter behavior for posts
                        qb.andWhere('posts.page', '=', false);
                        qb.andWhere('posts.status', '=', 'published');
                    }
                });
            }
        },
        areas: {
            posts: function addPostCountToAreas(model) {
                model.query('columns', 'areas.*', function (qb) {
                    qb.count('posts.id')
                        .from('posts')
                        .leftOuterJoin('posts_areas', 'posts.id', 'posts_areas.post_id')
                        .whereRaw('posts_areas.area_id = areas.id')
                        .as('count__posts');

                    if (model.isPublicContext()) {
                        // @TODO use the filter behavior for posts
                        qb.andWhere('posts.page', '=', false);
                        qb.andWhere('posts.status', '=', 'published');
                    }
                });
            },
            areas: function addAreaCountToAreas(model) {
                model.query('columns', 'areas.*', function (qb) {
                    qb.count('areas.id')
                        .from('areas')
                        .leftOuterJoin('areas', 'areas.id', 'areas.parent_id')
                        .whereRaw('areas.parent_id = areas.id')
                        .as('count__areas');

                    if (model.isPublicContext()) {
                        // @TODO use the filter behavior for posts
                        qb.andWhere('areas.page', '=', false);
                        qb.andWhere('areas.status', '=', 'published');
                    }
                });
            }
        },
        users: {
            posts: function addPostCountToTags(model) {
                model.query('columns', 'users.*', function (qb) {
                    qb.count('posts.id')
                        .from('posts')
                        .whereRaw('posts.author_id = users.id')
                        .as('count__posts');

                    if (model.isPublicContext()) {
                        // @TODO use the filter behavior for posts
                        qb.andWhere('posts.page', '=', false);
                        qb.andWhere('posts.status', '=', 'published');
                    }
                });
            }
        }
    };

    Model = Bookshelf.Model.extend({
        addCounts: function (options) {
            if (!options) {
                return;
            }

            var tableName = _.result(this, 'tableName');

            if (options.include && options.include.indexOf('count.posts') > -1) {
                // remove post_count from withRelated and include
                options.withRelated = _.pull([].concat(options.withRelated), 'count.posts');

                // Call the query builder
                countQueryBuilder[tableName].posts(this);
            }

            if (options.include && options.include.indexOf('count.areas') > -1) {
                // remove post_count from withRelated and include
                options.withRelated = _.pull([].concat(options.withRelated), 'count.areas');

                // Call the query builder
                countQueryBuilder[tableName].posts(this);
            }
        },
        fetch: function () {
            this.addCounts.apply(this, arguments);

            if (this.debug) {
                console.log('QUERY', this.query().toQuery());
            }

            // Call parent fetch
            return modelProto.fetch.apply(this, arguments);
        },
        fetchAll: function () {
            this.addCounts.apply(this, arguments);

            if (this.debug) {
                console.log('QUERY', this.query().toQuery());
            }

            // Call parent fetchAll
            return modelProto.fetchAll.apply(this, arguments);
        },

        finalize: function (attrs) {
            var countRegex = /^(count)(__)(.*)$/;
            _.forOwn(attrs, function (value, key) {
                var match = key.match(countRegex);
                if (match) {
                    attrs[match[1]] = attrs[match[1]] || {};
                    attrs[match[1]][match[3]] = value;
                    delete attrs[key];
                }
            });

            return attrs;
        }
    });

    Bookshelf.Model = Model;
};
