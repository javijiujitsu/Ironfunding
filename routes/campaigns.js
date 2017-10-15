const express  = require('express');
const Campaign = require('../models/campaign');
const TYPES    = require('../models/campaign-types');
const router   = express.Router();
const { ensureLoggedIn }  = require('connect-ensure-login');
const {
  authorizeCampaign,
  checkOwnership
} = require('../middleware/campaign-authorization');
router.get('/new', (req, res) => {
  res.render('campaigns/new', { types: TYPES });
});

router.post('/', ensureLoggedIn('/login'), (req, res, next) => {
  const newCampaign = new Campaign({
    title: req.body.title,
    goal: req.body.goal,
    description: req.body.description,
    category: req.body.category,
    deadline: req.body.deadline,
    // We're assuming a user is logged in here
    // If they aren't, this will throw an error
    _creator: req.user._id
  });




newCampaign.save( (err) => {
  if (err) {
    res.render('campaigns/new', { campaign: newCampaign, types: TYPES });
  } else {
    res.redirect(`/campaigns/${newCampaign._id}`);
  }
});
});

router.get('/:id', checkOwnership, (req, res, next) => {
  Campaign.findById(req.params.id, (err, campaign) => {
    if (err){ return next(err); }

   campaign.populate('_creator', (err, campaign) => {
      if (err){ return next(err); }
      return res.render('campaigns/show', { campaign });
    });
  });
});

router.get('/:id/edit', ensureLoggedIn('/login'), authorizeCampaign, (req, res, next) => {
  Campaign.findById(req.params.id, (err, campaign) => {
    if (err)       { return next(err) }
    if (!campaign) { return next(new Error("404")) }
    return res.render('campaigns/edit', { campaign, types: TYPES })
  });
});

router.post('/:id', ensureLoggedIn('/login'), authorizeCampaign, (req, res, next) => {
  const updates = {
    title: req.body.title,
    goal: req.body.goal,
    description: req.body.description,
    category: req.body.category,
    deadline: req.body.deadline
  };

 router.get('/campaigns/:id/rewards', (req, res, next) => {
    Campaign
      .findById(req.params.id)
      .populate('rewards')
      .exec(   (err, campaign) => {
        if (err || !campaign){ return next(new Error("404")); }
        res.render('rewards/index', { campaign });
      });
  });

 router.post('/campaigns/:id/rewards', authorizeCampaign, (req, res, next) => {
    Campaign.findById(req.params.id, (err, campaign) => {
      if (err || !campaign) { return next(new Error("404")); }

     const reward = new Reward({
        title      : req.body.title,
        description: req.body.description,
        amount     : req.body.amount,
        delivery   : req.body.delivery,
        _campaign  : campaign._id
      });

     reward.save( (err) => {
        if (err){
          return res.render('rewards/new', { errors: reward.errors });
        }

       campaign.rewards.push(reward._id);
        campaign.save( (err) => {
          if (err) {
            return next(err);
          } else {
            return res.redirect(`/campaigns/${campaign._id}`);
          }
        });
      });
    });
  });




 Campaign.findByIdAndUpdate(req.params.id, updates, (err, campaign) => {
    if (err) {
      return res.render('campaigns/edit', {
        campaign,
        errors: campaign.errors
      });
    }
    if (!campaign) {
      return next(new Error('404'));
    }
    return res.redirect(`/campaigns/${campaign._id}`);
  });
});






module.exports = router;
