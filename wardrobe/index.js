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
    var outputs = [
        "Hi I'm your smart-wardrobe. I'm gonna support you finding the right clothes for your favourite location"
    ]
    var i = Math.floor(Math.random() * outputs.length);
    var speechOutput = outputs[i];
    var repromptText = "Do you want to know what to wear?";
    response.ask(speechOutput, repromptText);
};

HelloWorld.prototype.eventHandlers.onSessionEnded = function(sessionEndedRequest, session) {
    console.log("HelloWorld onSessionEnded requestId: " + sessionEndedRequest.requestId +
        ", sessionId: " + session.sessionId);
    // any cleanup logic goes here
};

HelloWorld.prototype.intentHandlers = {
    "ClothesIntent": function(intent, session, response) {
        var loc = intent.slots.location.value;
        makeRequest(loc, function(result) {
            if (result) {
                var sensorObject = JSON.parse(result)
                var temperatureSensor = findSensor(sensorObject.sensors, "Temperatur");
                var humiditySensor = findSensor(sensorObject.sensors, "rel. Luftfeuchte");
                var temp = temperatureSensor.lastMeasurement.value;
                var humidity = humiditySensor.lastMeasurement.value;
                var r = "It's " + temp + " degrees Celsius in " + loc + ". ." + createPhrasesWithTemperature(temp) + " " + createPhraseWithRain(humidity);
            } else {
                var r = "Sorry, we aren't able to fetch the data for your location: " + loc;
            }
            response.tellWithCard(r, "Yo Karte", r);
        });

    },
    "DialogIntent": function(intent, session, response) {
        response.ask("Which location?", "Which location?");
    },
    "SbIntent": function(intent, session, response) {
        response.ask("Your senseboxes, Münster , Düsseldorf, Munich and Vienna are healthy and working. It's nice that you asked.", "Your senseboxes, Münster , Düsseldorf, Munich and Vienna are healthy and working. It's nice that you asked.");
    },
    "YoIntent": function(intent, session, response) {
        response.ask("Hello, I'm your smart-wardrobe. I'm going to support you finding the right clothes to wear in your favourite location. If you're ready, just ask for a location.");
    },
    "WatIntent": function(intent, session, response) {
        response.ask("Dude, just go naked.", "Dude, just go naked.");
    },
    "AMAZON.HelpIntent": function(intent, session, response) {
        response.ask("No, I won't help you", "No, I won't help you");
    }
};

function findSensor(arr, sensorName) {
    for (var i in arr) {
        if (arr[i].title == sensorName) return arr[i];
    }
    return "örrör!"
}

function createPhrasesWithTemperature(temp) {
    var answer = "";
    if (temp > 27) {
        answer = "Dude, it's so freakin' hot, just go naked."
    } else if (temp > 20) {
        answer = "It's pretty warm out there, so put shorts and a funky t-shirt on."
    } else if (temp > 10) {
        answer = "You should put on jeans and a light jacket."
    } else {
        answer = "Put on warm clothes, it's really freezin' outside!"
    };
    return answer;
};

function createPhraseWithRain(rainfall) {
    if (rainfall > 90) {
        return "I would also take an umbrella, it is raining outside."
    }
    return "";
}

// Create the handler that responds to the Alexa Request.
exports.handler = function(event, context) {
    // Create an instance of the HelloWorld skill.
    var helloWorld = new HelloWorld();
    console.log(event);
    helloWorld.execute(event, context);
};
