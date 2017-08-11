console.log('Loading event');
var AWS = require('aws-sdk');
var dynamodb = new AWS.DynamoDB();

exports.handler = function(event, context) {
    
  AWS.config.update({
    region: "us-east-1"
  });
  var docClient = new AWS.DynamoDB.DocumentClient();

  console.log(event);
  var votedForName = event.name;
  var votedForEmail = event.email;
  var timestamp = new Date();

  var tableName = 'PartiuByYouVoteApp';
  docClient.put({
      'TableName': tableName,
      'Item': {
        "Name": votedForName,
        "CreatedAt": timestamp.toISOString(),
        "Email": votedForEmail
      }
    }, function(err, data) {
      if (err) {
        console.log(err);
        context.fail(err);
      } else {
        context.done(null, {success:true});
        console.log("Voto recebido para %s", votedForName);
      }
    });

}
