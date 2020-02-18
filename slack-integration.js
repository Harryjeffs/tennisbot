'use strict';
require('dotenv').config();
const _ = require('underscore');

// The Firebase Admin SDK to access the Firebase Realtime Database.
const admin = require('firebase-admin');

// Fetch the service account key JSON file contents
var serviceAccount = require('./serviceAccountDatabase');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://table-tennis-e0355.firebaseio.com"
});

// Define database variable linked to the Realtime Database.
var db = admin.database();

const { WebClient } = require('@slack/web-api');

// An access token (from your Slack app or custom integration - xoxp, xoxb)
const token = process.env.SLACK_TOKEN;

const web = new WebClient(token);

// This argument can be a channel ID, a DM ID, a MPDM ID, or a group ID
const conversationId = 'CQSHZE09X';

var ref = db.ref("games");

let playersJson;

const playersRef = db.ref("players");
let sentOnce = false;

//Check to see if this is the first load or not.
var child_added_first = true;

ref.limitToLast(1).on("child_added", function(snapshot) {
    var gameData = snapshot.val();
    if (gameData != undefined && !child_added_first){
        var playerKey = snapshot.key;
        playersRef.on('value', function (snapshot) {
            playersJson = snapshot.val();

            _.find(playersJson, function (value, key) {
                var playersQuery = db.ref("playersgame/" + key);
                playersQuery.orderByChild("game").equalTo(playerKey).on("value",function(snapshot){
                    if (typeof snapshot.val() !== 'undefined' && snapshot.val()){
                        let result = snapshot.val();
                        result = result[Object.keys(result)[0]];
                        if (result.won) {
                            console.log(result);
                            var firstPlayer = db.ref("players/" + result.t1p1);
                            var secondPlayer = db.ref("players/" + result.t2p1);

                            firstPlayer.on("value", function(snapshot) {
                                var playerOneData = snapshot.val();
                                console.log(playerOneData);
                                secondPlayer.on("value", function(snapshot) {
                                    var secondsOneData = snapshot.val();
                                    if (!sentOnce){
                                        var message = playerOneData.name.toString().trim() + " just played " + secondsOneData.name.toString().trim() + " and won *" + result.t1_points + "* games to *" + result.t2_points + "*";
                                        // See: https://api.slack.com/methods/chat.postMessage
                                        web.chat.postMessage({channel: conversationId, text: message});
                                        sentOnce = true;
                                    }
                                });
                            });
                        }
                    }
                });
            });
        });
    }
    child_added_first = false;
});