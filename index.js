'use strict';
require('dotenv').config();

// The Cloud Functions for Firebase SDK to create Cloud Functions and setup triggers.
const functions = require('firebase-functions');

// The Firebase Admin SDK to access the Firebase Realtime Database.
const admin = require('firebase-admin');

admin.initializeApp({
    credential: admin.credential.applicationDefault(),
    databaseURL: process.env.DATABASE_URL
});

// Define database variable linked to the Realtime Database.
const database = admin.database();

// Get the contents of slack-integration.js
const slackInt = require('./slack-integration.js');

exports.slackLinker = functions.https.onRequest((req, res) => {
    slackInt.handler(req, res, database, admin);
});