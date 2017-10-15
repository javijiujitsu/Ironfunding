const express = require('express');
const router  = express.Router();
const Campaign = require('../models/campaign');

/* GET home page. */
router.get('/', (req, res, next) => {

Campaign
   .find({})
   .populate('_creator')
   .exec((err, campaigns) => {
     res.render('index', { campaigns });
   });
 });

module.exports = router;
