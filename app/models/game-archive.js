var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.Types.ObjectId;
var _ = require('lodash');

/**
 * The game model
 * @class GameArchive
 * @extends mongoose.Schema
 */
var GameArchiveSchema = new Schema({

	/**
	 * The game title
	 * @property {String} title
	 */
	title: {
		type: String,
		trim: true,
		required: true
	},

	/**
	 * The URI slug to get game
	 * @property {String} slug
	 */
	slug: {
		type:String,
		unique: true,
		lowercase: true,
		trim: true,
		required: true
	},

	/**
	 * The bundle ID (e.g. "com.domain.game.SomeGame")
	 * @property {String} bundleId
	 */
	bundleId: {
		type:String,
		unique: true,
		trim: true,
		required: true
	},

	/**
	 * The path to the repository
	 * @property {String} repository
	 */
	repository: {
		type: String,
		trim: true,
		required: true
	},

	/**
	 * The S3 budget location
	 * @property {String} location
	 */
	location: {
		type: String,
		required: true
	},

	/**
	 * A description of the game
	 * @property {String} description
	 */
	description: {
		type: String,
		trim: true
	},

	/**
	 * The date the game was created
	 * @property {Date} created
	 */
	created: Date,

	/**
	 * The date the game was updated
	 * @property {Date} updated
	 */
	updated: Date,

	/**
	 * The collection of releases
	 * @property {Array} releases
	 */
	releases: [{
		type: ObjectId,
		ref: 'Release'
	}],

	/**
	 * The collection of groups that can access
	 * @property {Array} groups
	 */
	groups:
	[{
		/**
		 * The collection of games group can access
		 * where 0 = read, 1 = write, 2 = admin
		 * @property {Int} games.permission
		 */
		permission: {
			type: Number,
			default:0,
			required: true,
			min: 0,
			max: 2
		},

		/**
		 * The group managing this game
		 * @property {Game} groups.group
		 */
		group: {
			type: ObjectId,
			required: true,
			ref: 'Group'
		}
	}],

	/**
	 * The default capabilities, this is used to auto
	 * populate the next release. Actual capabilities
	 * are used with in the release object.
	 * @property {Object} capabilities
	 */
	capabilities: require('./capabilities'),

	/**
	 * The thumbnail image
	 * @property {Buffer} thumbnail
	 */
	thumbnail: {
		type: Buffer,
		required: false
	}
});

GameArchiveSchema.plugin(require('mongoose-unique-validator'));

// Convert the base64 image into a Buffer
GameArchiveSchema.pre('save', function(next)
{
	if (this.isModified('thumbnail'))
	{
		this.thumbnail = new Buffer(this.thumbnail, "base64");
	}
	return next();
});

/**
 * Get all the games
 * @method getAll
 * @param {function} callback The callback
 * @return {Promise} The async Promise
 */
GameArchiveSchema.statics.getAll = function(callback)
{
	return this.find({}, callback);
};

/**
 * Get a game by ID
 * @method getById
 * @param {string} id The Object id
 * @param {function} callback The callback
 * @return {Promise} The async Promise
 */
GameArchiveSchema.statics.getById = function(id, callback)
{
	return this.findOne({ _id: id }, callback);
};

/**
 * Get the list of games by groups
 * @method getGamesByGroups
 * @static
 * @param {Array} groups The collection of Group documents
 * @param {function} callback The callback method
 * @return {Promise} The promise for async calling
 */
GameArchiveSchema.statics.getGamesByGroups = function(groups, callback)
{
	return this.find({
		"groups.group": {
			$in: _.pluck(groups, "_id")
		}
	}, callback);
};

/**
 * Get the list of games by group
 * @method getGamesByGroup
 * @static
 * @param {Group} group The group document
 * @param {function} callback The callback method
 * @return {Promise} The promise for async calling
 */
GameArchiveSchema.statics.getGamesByGroup = function(group, callback)
{
	return this.find({"groups.group": group.id}, callback);
};

/**
 * Get a collection of games by ids
 * @method getByIds
 * @param {string} ids The Object ids
 * @param {function} callback The callback
 * @return {Promise} The async Promise
 */
GameArchiveSchema.statics.getByIds = function(ids, callback)
{
	return this.find({ _id: { $in: ids }})
		.sort('title')
		.exec(callback);
};

/**
 * Get a game by slug
 * @method getBySlug
 * @param {string} slugOrBundleId The game slug or bundleId
 * @param {function} callback The callback
 * @return {Promise} The async Promise
 */
GameArchiveSchema.statics.getBySlug = function(slug, callback)
{
	return this.findOne({ 'slug': slug }, callback);
};

/**
 * Get a game by slug or bundleId
 * @method getBySlugOrBundleId
 * @param {string} slugOrBundleId The game slug or bundleId
 * @param {function} callback The callback
 * @return {Promise} The async Promise
 */
GameArchiveSchema.statics.getBySlugOrBundleId = function(slugOrBundleId, callback)
{
	return this.findOne({ '$or':
		[
			{ 'slug': slugOrBundleId },
			{ 'bundleId': slugOrBundleId }
		]
	}, callback);
};

/**
 * Get a game by slug
 * @method getByBundleId
 * @param {string} bundleId The game bundleId
 * @param {function} callback The callback
 * @return {Promise} The async Promise
 */
GameArchiveSchema.statics.getByBundleId = function(bundleId, callback)
{
	return this.findOne({ bundleId: bundleId }, callback);
};

/**
 * Get users by search
 * @method getBySearch
 * @static
 * @param {string} search The random token to search on
 * @param {int} limit The number of results
 * @param {function} callback The callback with result
 * @return {Promise} The promise object for async action
 */
GameArchiveSchema.statics.getBySearch = function(search, limit, callback)
{
	return this.find({ title: new RegExp(search, "i") })
		.limit(limit)
		.select('title slug')
		.sort('title')
		.exec(callback);
};

/**
 * Add the group or groups to the game
 * @method addGame
 * @param {String|Array} ids The group Id
 * @param {int|Array} permission The read (0), write (1), admin(2) permission
 * @param {function} callback The callback with result
 * @return {Promise} The promise object for async action
 */
GameArchiveSchema.methods.addGroup = function(ids, permissions, callback)
{
	if (!Array.isArray(ids)) ids = [ids];
	if (!Array.isArray(permissions)) permissions = [permissions];

	if (ids.length != permissions.length)
	{
		return callback('Groups and permissions mismatch');
	}

	var groups = this.groups;
	_.each(ids, function(id, i)
	{
		groups.push(
		{
			group: id,
			permission: permissions[i]
		});
	});

	return this.save(callback);
};

/**
 * Get the user permission and token
 * @method  getAccess
 * @param  {mongoose.User} user The current user
 */
GameArchiveSchema.methods.getAccess = function(user, callback)
{
	var result = {
		permission: -1,
		token: null
	};

	// Check for the user group's privilege
	// if we're a producer or admin, use their settings first
	if (user.privilege)
	{
		var group = user.groups[0];
		result.permission = user.privilege;
		result.token = group.token;
	}

	// Go through all the game groups to determine
	// if there's a match with the current user
	_.each(this.groups, function(entry)
	{
		if (user.inGroup(entry.group) && entry.permission >= result.permission)
		{
			result.token = entry.group.token;
			result.permission = entry.permission;
		}
	});

	if (result == -1)
	{
		callback('Access denied', this, result);
	}
	else
	{
		callback(null, this, result);
	}
};

/**
 * If a game contains a group
 * @param  {Group}  group The group to check
 * @return {Boolean} If the group is contained within the game
 */
GameArchiveSchema.methods.hasGroup = function(group)
{
	return group.privilege || _.find(this.groups, function(entry)
	{
		// If the groups are populated
		if (entry.group._id)
			return entry.group._id.equals(group._id);
		else
			return entry.group.equals(group._id);
	});
};

/**
 * Check to see if a token has permission to view/edit game
 * @method  hasPermission
 * @param  {String}   token    The user or group token
 * @param  {Function} callback Returns the err and game
 */
GameArchiveSchema.methods.hasPermission = function(token, callback)
{
	var game = this;
	if (!token)
	{
		return callback('Token is required');
	}
	this.model('Group').getByToken(token, function(err, group)
	{
		if (!group)
		{
			return callback('Token is invalid');
		}
		if (!game.hasGroup(group))
		{
			return callback('Unauthorized token');
		}
		callback(null, game);
	});
};

/**
 * Add the group to the game
 * @method addGroup
 * @static
 * @param {String} id The game id
 * @param {object} group The group to add
 * @param {int} group.permission The group permission
 * @param {ObjectId} group.group The group id
 * @param {function} callback The callback with result
 * @return {Promise} The promise object for async action
 */
GameArchiveSchema.statics.addGroup = function(ids, groupId, permission, callback)
{
	if (!Array.isArray(ids)) ids = [ids];

	var group = {
		group: groupId,
		permission: permission
	};

	this.update(
		{_id: {$in: ids}},
		{$push: {groups: group}},
		{multi: true},
		callback
	);
};

/**
 * Remove the group from the game
 * @method removeGroup
 * @static
 * @param {null|String|ObjectId|Array} ids The game ids, if null remove group from all
 * @param {function} callback The callback with result
 * @return {Promise} The promise object for async action
 */
GameArchiveSchema.statics.removeGroup = function(ids, groupId, callback)
{
	var query = {};
	if (ids)
	{
		if (!Array.isArray(ids)) ids = [ids];
		query = { _id: { $in: ids }};
	}
	return this.update(
		query,
		{$pull: {groups: {group : groupId }}},
		{multi: true},
		callback
	);
};

/**
 * Remove the group from the game
 * @method removeGroup
 * @param {String|ObjectId} group The group to remove
 * @param {function} callback The callback with result
 * @return {Promise} The promise object for async action
 */
GameArchiveSchema.methods.removeGroup = function(group, callback)
{
	this.groups = _.filter(this.groups, function(entry)
	{
		return !entry.group._id.equals(group);
	});
	return this.save(callback);
};

/**
 * Remove the group from the game
 * @method changePermission
 * @param {String} group The groupID
 * @param {int} permission The new permission
 * @param {function} callback The callback with result
 * @return {Promise} The promise object for async action
 */
GameArchiveSchema.methods.changePermission = function(group, permission, callback)
{
	_.each(this.groups, function(entry)
	{
		if (entry.group._id.equals(group))
		{
			entry.permission = permission;
		}
	});
	return this.save(callback);
};

module.exports = mongoose.model('GameArchive', GameArchiveSchema);
