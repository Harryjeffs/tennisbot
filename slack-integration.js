exports.handler = (req, res, database, admin) =>{
    require('dotenv').config();

    const queryString = require('query-string');

    var db = admin.database();
    var ref = db.ref("playersgame/");

    ref.once("child_added", function(snapshot) {
        console.log(snapshot.val());
    });
};