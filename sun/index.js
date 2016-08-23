/**
    Copyright 2014-2015 Amazon.com, Inc. or its affiliates. All Rights Reserved.

    Licensed under the Apache License, Version 2.0 (the "License"). You may not use this file except in compliance with the License. A copy of the License is located at

        http://aws.amazon.com/apache2.0/

    or in the "license" file accompanying this file. This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

/**
 * This simple sample has no external dependencies or session management, and shows the most basic
 * example of how to create a Lambda function for handling Alexa Skill requests.
 *
 * Examples:
 * One-shot model:
 *  User: "Alexa, tell Greeter to say hello"
 *  Alexa: "Hello World!"
 */
var http = require("https");

var boxes = ["57585de44bab38000e49fa97", "56fc046445fd40c81965e5d2", "57b6e6b9b17d6811001c218d", "56fbf16645fd40c81965ce3a"]; //Reihenfolge: Münster, DDorf, Wien, München

function makeRequest(city, callback) {

    var box = boxes[getIndexForBoxesArray(city)];
    var options = {
        "method": "GET",
        "hostname": "api.opensensemap.org",
        "path": "/boxes/" + box + "/sensors"
    };

    var req = http.request(options, function(res) {
        var chunks = [];

        res.on("data", function(chunk) {
            chunks.push(chunk)
        });

        res.on("end", function() {
            var body = Buffer.concat(chunks);
            callback(body.toString())
        });
    });
    req.end();
};

function getIndexForBoxesArray(city) {
    if (city === "monster" || city === "men's there" || city === "muenster" || city === "munster") {
        return 0
    };
    if (city === "Düsseldorf" || city === "düsseldorf" || city === "dusseldorf" || city === "Dusseldorf") {
        return 1
    };
    if (city === "Vienna" || city === "vienna") {
        return 2
    };
    if (city === "Munich" || city === "munich" || city === "München" || city === "münchen") {
        return 3
    };
    return undefined;
}

/**
 * App ID for the skill
 */
var APP_ID = undefined;
//replace with "amzn1.echo-sdk-ams.app.amzn1.ask.skill.f1c23f55-1469-4a31-98d4-1e426f497427";

/**
 * The AlexaSkill prototype and helper functions
 */
var AlexaSkill = require('./AlexaSkill');

/**
 * HelloWorld is a child of AlexaSkill.
 * To read more about inheritance in JavaScript, see the link below.
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Introduction_to_Object-Oriented_JavaScript#Inheritance
 */
var HelloWorld = function() {
    AlexaSkill.call(this, APP_ID);
};

// Extend AlexaSkill
HelloWorld.prototype = Object.create(AlexaSkill.prototype);
HelloWorld.prototype.constructor = HelloWorld;

HelloWorld.prototype.eventHandlers.onSessionStarted = function(sessionStartedRequest, session) {
    console.log("HelloWorld onSessionStarted requestId: " + sessionStartedRequest.requestId +
        ", sessionId: " + session.sessionId);
    // any initialization logic goes here
};

HelloWorld.prototype.eventHandlers.onLaunch = function(launchRequest, session, response) {
    console.log("HelloWorld onLaunch requestId: " + launchRequest.requestId + ", sessionId: " + session.sessionId);
    var speechOutput = "Hey bro. You can ask me if you're going to need suncream today.";
    var repromptText = "You can say yo";
    response.ask(speechOutput, repromptText);
};

HelloWorld.prototype.eventHandlers.onSessionEnded = function(sessionEndedRequest, session) {
    console.log("HelloWorld onSessionEnded requestId: " + sessionEndedRequest.requestId +
        ", sessionId: " + session.sessionId);
    // any cleanup logic goes here
};

HelloWorld.prototype.intentHandlers = {
    "YoIntent": function(intent, session, response) {
        response.ask("Luca and Andreas are awesome. Really awesome.", "Luca and Andreas are awesome. Really awesome.");
    },

    "WatIntent": function(intent, session, response) {
        response.ask("wat,wat,wat,wat,wat,wat,wat,wat,wat,wat,wat,wat,wat,wat,wat,wat,wat,wat,wat", "wat,wat,wat,wat,wat,wat,wat,wat,wat,wat,wat,wat,wat,wat,wat,wat,wat,wat,wat");
    },
    "DialogIntent": function(intent, session, response) {
        response.ask("Just ask a city you want to know if you need suncream.","Just ask a city you want to know if you need suncream.");
    },
    "SunIntent": function(intent, session, response) {
        var loc = intent.slots.location.value;

        var answersHigh = [
            "It looks like you would need suncream",
            "I think that suncream isn't a bad idea",
            "It's plenty of sun, Yeah, maybe you should use suncream",
        ];
        var answersLow = [
            "It's cloudy. No suncream needed.",
            "No suncream is recommended if the radiation is so low.",
            "You don't need suncream. But you need die antwoord.",
        ];
        var answerIndex = Math.floor(Math.random() * answersHigh.length);
        var suffixHigh = answersHigh[answerIndex];
        var suffixLow = answersLow[answerIndex];

        var answer;

        makeRequest(loc, function(result) {
            if (result) {
                var sensorObject = JSON.parse(result)
                var UVSensor = findUVSensor(sensorObject.sensors);
                var value = UVSensor.lastMeasurement.value;
                var r = "The intensity in " + loc + " is " + value + " milliwatt per square centimetres..."
                if (value > 30) {
                    answer = r + suffixHigh;
                } else {
                    answer = r + suffixLow
                }
            } else {
                var r = "It looks, like you're not going to need suncream in " + loc;
            }
            response.tellWithCard(answer, "Yo Karte", answer);
        });

    },
    "AMAZON.HelpIntent": function(intent, session, response) {
        response.ask("No, I won't help you", "No, I won't help you");
    }
};

function findUVSensor(arr) {
    for (var i in arr) {
        if (arr[i].title == "UV-Intensität") return arr[i]
    }
}

// Create the handler that responds to the Alexa Request.
exports.handler = function(event, context) {
    // Create an instance of the HelloWorld skill.
    var helloWorld = new HelloWorld();
    console.log(event);
    helloWorld.execute(event, context);
};
