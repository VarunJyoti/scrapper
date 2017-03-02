var express = require('express');
var router = express.Router();

var scrapper = require('./../scrapper');

/* GET users listing. */
router.get('/scrapping/:trainNo', function (req, res, next) {
    var trainNo = req.params.trainNo || "";
    scrapper(trainNo,function(result){
        res.json(result);
    });
});


module.exports = router;
