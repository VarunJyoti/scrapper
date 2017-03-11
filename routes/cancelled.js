var express = require('express');
var router = express.Router();

var cancelled = require('./../cancelled');

/* GET users listing. */
router.get('/getCancelled', function (req, res, next) {
    cancelled(function(result){
        res.json(result);
    });
 });


module.exports = router;
