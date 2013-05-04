var request = require('request');
var config = require('../config');

var api_key = config.api_key;
function getRandomWord(callback) {
    
    var cachebuster = Math.round(new Date().getTime() / 1000);
    var params = 'hasDictionaryDef=false&minCorpusCount=0&maxCorpusCount=-1&minDictionaryCount=1&maxDictionaryCount=-1&minLength=5&maxLength=-1&api_key=' + api_key;
    var route = '/v4/words.json/randomWord?' + params + '&cb=' + cachebuster;
    var options = {

        uri: 'http://api.wordnik.com' + route
      , port: 80
      , path: route
      , method: 'get'

    };
    request(options, function (err, wnres, data) { //chunks are already aggregated
        console.log("Got response: " + wnres.statusCode);
        data = JSON.parse(data);
        return callback(data);
    });
}

function getDefinition(word, callback) {

    var params = 'limit=1&includeRelated=true&useCanonical=false&includeTags=false&api_key=' + api_key;
    var route = '/v4/word.json/' + word + '/definitions?' + params;
    var options = {

        uri: 'http://api.wordnik.com' + route
      , port: 80
      , path: route
      , method: 'get'

    };
    request(options, function (err, wnres, data) { //chunks are already aggregated
        console.log("Got response: " + wnres.statusCode);
        data = JSON.parse(data);
        return callback(data[0].text);
    });
}
exports.index = function (req, res) {


    var wordObs = new Array();

    var wordObj = new Object();
    var randomWord = getRandomWord(function (word) {
        var def = getDefinition(word.word, function (def) {
            wordObj.word = word.word;
            wordObj.definition = def;
            wordObs.push(wordObj);

            //get one more
            wordObj = new Object();
            randomWord = getRandomWord(function (word) {
                var def = getDefinition(word.word, function (def) {
                    wordObj.word = word.word;
                    wordObj.definition = def;
                    wordObs.push(wordObj);
                    //get one more
                    wordObj = new Object();
                    randomWord = getRandomWord(function (word) {
                        var def = getDefinition(word.word, function (def) {
                            wordObj.word = word.word;
                            wordObj.definition = def;
                            wordObs.push(wordObj);
                            res.render('index', { data: wordObs });
                        });
                    });
                });
            });

        });

    });




    //res.render('index', { data: data });
};
