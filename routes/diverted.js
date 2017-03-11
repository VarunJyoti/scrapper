var express = require('express');
var router = express.Router();

var diverted = require('./../diverted');

/* GET users listing. */
router.get('/getDiverted', function (req, res, next) {
    diverted(function(result){
        res.json(result);
    });
 });


module.exports = router;
