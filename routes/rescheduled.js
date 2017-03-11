var express = require('express');
var router = express.Router();

var rescheduled = require('./../rescheduled');

/* GET users listing. */
router.get('/getRescheduled', function (req, res, next) {
    rescheduled(function(result){
        res.json(result);
    });
 });


module.exports = router;
