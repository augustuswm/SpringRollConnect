var router = require('express').Router(),
	async = require('async'),
	Game = require('../../models/game'),
	Group = require('../../models/group'),
	Release = require('../../models/release'),
	response = require('../../helpers/response'),
	_ = require('lodash'),
    log = require('../../helpers/logger');

router.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

router.post('/:slug', function(req, res)
{
	req.checkBody('status', 'Status must be one of: "dev", "qa", "stage", "prod"').isStatus();
	req.checkBody('commitId', 'Commit ID must be a valid Git commit has').isCommit();
	req.checkBody('token', 'Token is required').isToken();
	
	if (req.body.verison)
		req.checkBody('version', 'Not a properly formatted Semantic Version').isSemver();

	var errors = req.validationErrors();

	if (errors)
	{
		if (req.body.redirect)
		{
			req.flash('errors', errors);
			res.redirect(req.body.redirect);
		}
		else
		{
			log.error("Validation error adding release");
			log.error(errors);

			res.send({
				success:false,
				data: errors
			});
		}
		return;
	}

	async.waterfall([
		function(done)
		{
			Game.getBySlugOrBundleId(req.params.slug, done).select('-thumbnail');
		},
		function(game, done)
		{
			game.hasPermission(req.body.token, done);
		},
		function(game, done)
		{
			// Better handling of a unique commitId
			Release.getByCommitId(req.body.commitId, function(err, release)
			{
				if (!!req.body.warnUniqueCommit && !!release)
				{
					done('The Commit ID is already taken');
				}
				else
				{
					done(err, game, release);
				}
			});
		},
		function(game, release, done)
		{
			// If we already have a release
			// lets just modify the updated timestamp
			// and leave everything else the same
			if (release)
			{
				release.updated = Date.now();
				release.save(function(err)
				{
					done(err, game);
				});
				return;
			}
			var values = _.clone(req.body);
			values.game = game._id;
			delete values.token;
			values.created = values.updated = Date.now();

			// If the capabilities aren't set, inherit the
			// default game capabilities
			if (!values.capabilities)
			{
				values.capabilities = game.capabilities.toObject();
			}
			// Or else update the game defaults
			else
			{
				_.assign(
					game.capabilities, 
					_.cloneDeep(values.capabilities)
				);
				game.save();
			}
			var newRelease = new Release(values);
			newRelease.save(function(err, release)
			{
				if (err) return done(err, game);

				game.releases.push(release._id);
				game.updated = Date.now();
				game.save(function(err, result)
				{
					done(err, game);
				});
			});
		},
		function(game, done)
		{
			Release.getByIdsAndStatus(game.releases, "dev", function(err, releases)
			{
				var maxDevReleases = CONFIGURATION.maxDevReleases;
				if (releases.length > maxDevReleases)
				{
					_.each(_.dropRight(releases, maxDevReleases), function(release)
					{
						Release.removeById(release._id, function(){});
					});
				}
				done(null, game);
			});
		}
	], 
	function(err, result)
	{
		if (err)
		{			
			if (req.body.redirect)
			{
				req.flash('error', 'Unable to add the release: ' + err);
				res.redirect(req.body.redirect);
			}
			else
			{
				log.error('Unable to add the release');
				log.error(err);

				res.status(500).send({
					success:false,
					data: 'Unable to add the release'
				});
			}
			return;
		}

		if (req.body.redirect)
		{
			req.flash('success', 'Release added successfully');
			res.redirect(req.body.redirect);
		}
		else
		{
			res.send({
				success: true, 
				data: result
			});
		}
	});
});

router.get('/:slugOrBundleId', function(req, res)
{
	req.checkQuery('token').optional().isToken();
	req.checkQuery('status').optional().isStatus();
	req.checkQuery('commitId').optional().isCommit();
	req.checkQuery('version').optional().isSemver();
	if (req.validationErrors())
	{
		return response.call(res, "Invalid arguments");
	}
	Release.getByGame(
		req.params.slugOrBundleId, 
		{
			version: req.query.version,
			commitId: req.query.commitId,
			archive: req.query.archive,
			status: req.query.status || 'prod',
			token: req.query.token,
			debug: req.query.debug
		}, 
		response.bind(res)
	);
});

module.exports = router;
