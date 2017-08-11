console.log('Loading event');
var AWS = require('aws-sdk');
var dynamodb = new AWS.DynamoDB();

exports.handler = function(event, context) {

    console.log(event);
    var totals = {};
    var options = [];

    event.Records.forEach(function(record) {
        console.log(record);
        var votedForName = record.dynamodb['NewImage']['Name']['S'];

        if (totals.hasOwnProperty(votedForName)) {
            totals[votedForName]++;
        }
        else {
            totals[votedForName] = 1;
            options.push(votedForName);
        }
    });

    // Update the aggregation table with the total of
    // votes received from this series of updates

    var aggregatesTable = 'PartiuByYouVoteAppAggregates';
    for (var i = 0; i < options.length; i++) {
        updateAggregateForVote(options[i], totals[options[i]]);
    }

    function updateAggregateForVote(name, numVotes) {
        console.log("Updating Aggregate Vote ", name);
        console.log("For NumVotes: ", numVotes);

        dynamodb.updateItem({
            'TableName': aggregatesTable,
            'Key': { 'Name' : { 'S': name }},
            'UpdateExpression': 'add #vote :x',
            'ExpressionAttributeNames': {'#vote' : 'Vote'},
            'ExpressionAttributeValues': { ':x' : { "N" : numVotes.toString() } }
        }, function(err, data) {
            if (err) {
                console.log(err);
                context.fail("Error updating Aggregates table: ", err)
            } else {
                context.succeed("Successfully processed " + event.Records.length + " records.");
            }
        });
    }
};
