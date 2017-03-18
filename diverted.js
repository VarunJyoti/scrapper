var fs = require('fs');
var request = require('request');
var jar = request.jar();
var $ = require('cheerio');

function outer2() {
    var gotName = "", gotValue = "";

    /* GET users listing. */
    function processForTrain(resultCallback) {
        var url = 'http://enquiry.indianrail.gov.in/ntes/';
        if (gotName && gotValue && gotName.length == 10 && gotValue.length == 10) {
            getTrainData();
        } else {
            getKeyValueSecret();
        }

        function getKeyValueSecret() {
            request({
                uri: url,
                method: "GET",
                jar: jar
            }, function (error, response, html) {
                if (!error) {
                    var parsedHTML = $.load(html), tempName = "", count = 0;
                    parsedHTML('script').filter(function () {
                        var data = parsedHTML(this);
                        var textData = data.text().trim();
                        var split = [];
                        if (textData.indexOf("\n") === -1) {
                          
                            split = textData.split("=");
                            if (split.length > 1) {
                                if (tempName === split[1]) {
                                    count++;
                                }
                                tempName = split[1];
                            }
                           
                        }
                    });
                    if (count > 2) {
                        if (tempName.indexOf('"') !== -1) {
                            tempName = tempName.substring(1, tempName.length - 2);
                        }
                        gotName = tempName;
                      
                    }
                    parsedHTML('input').filter(function () {
                        var data = parsedHTML(this);
                        var name = $(data).attr('name')
                        var value = $(data).attr('value');
                        
                        if (name === gotName) {
                            gotValue = value;
                            
                        }
                    });

                    processCookies(response.headers["set-cookie"]);

                    getTrainData();
                }
            });
        }

        function processCookies(cookieArray) {
            if (cookieArray) {
                cookieArray.forEach(
                    function (cookiestr) {
                        
                        request.cookie(cookiestr);
                    }
                );
            }
        }

        

        function getTrainData() {
            if (gotName && gotValue && gotName.length == 10 && gotValue.length == 10) {
                var url = 'http://enquiry.indianrail.gov.in/ntes/NTES?action=showAllDivertedTrains&' + gotName + '=' + gotValue;
                
                request({
                    uri: url,
                    method: "GET",
                    jar: jar
                }, function (error1, response1, jsonData) {
                    
                    //convert to json
                    try {
                        var x = eval(jsonData);
                        resultCallback(x);
                    } catch (e) {
                        console.log(e);
                    }

                })
            }
        }
    }

    return processForTrain;
};


module.exports = outer2();
