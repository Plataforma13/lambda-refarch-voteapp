/* Copyright 2015 Amazon.com, Inc. or its affiliates. All Rights Reserved.

Licensed under the Apache License, Version 2.0 (the "License"). You may not use 
this file except in compliance with the License. A copy of the License is 
located at

http://aws.amazon.com/apache2.0/

or in the "license" file accompanying this file. This file is distributed on an 
"AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or 
implied. See the License for the specific language governing permissions and 
limitations under the License. */

// Region and IdentityPoolId should be set to your own values
AWS.config.region = 'us-east-1'; // Region
AWS.config.credentials = new AWS.CognitoIdentityCredentials({
    IdentityPoolId: 'us-east-1:af437144-3119-46e5-8d2e-8f640093fdce',
});

var dynamodb = new AWS.DynamoDB();
var params = { TableName: 'PartiuByYouVoteAppAggregates' };

/* Create the context for applying the chart to the HTML canvas */
var ctx = $("#graph").get(0).getContext("2d");
var graph = null;

$(function() {
  getData();
  $.ajaxSetup({ cache: false });
  /* Get the data every 60 seconds */
  setInterval(getData, 60000);
});

/* Makes a scan of the DynamoDB table to set a data object for the chart */
function getData() {
  dynamodb.scan(params, function(err, data) {
    if (err) {
      console.log(err);
      return null;
    } else {
      
      var totals = {};
      var labels = [];
      for (var i in data['Items']) {
        var votedForName = data['Items'][i]['Name']['S'];
        var votes = data['Items'][i]['Vote']['N'];
        totals[votedForName] = votes;
        labels.push(votedForName);
      }

      //var data = [];
      var values = [];
      var colors = [];
      for (var i = 0; i < labels.length; i++) {
        /*values.push({
          value: totals[labels[i]],
          color:'#'+Math.floor(Math.random()*16777215).toString(16),
          //highlight: "#c0392b",
          label: labels[i]
        });*/
        values.push(totals[labels[i]]);
        colors.push('#'+Math.floor(Math.random()*16777215).toString(16));
        //data.push(totals[labels[i]]);
      }

      data = {
        datasets: [{
            data:values,
            backgroundColor: colors
        }],    
        labels: labels
      };    
      console.log (data);

      if (graph == null) {
        /* Set the options for our chart */
        var options = { 
          segmentShowStroke : false,
          animation: {
              animateScale: true,
              animateRotate: true
          },
          percentageInnerCutout : 50,
          showToolTips: true,
          tooltipEvents: ["mousemove", "touchstart", "touchmove"],
          tooltipFontColor: "#fff",
          animationEasing : 'easeOutCirc',
          legend: {
            position: 'top',
          },
          responsive: true
        };

        //graph = new Chart(ctx).Doughnut(data, options);
        graph = new Chart(ctx, {
            type: 'doughnut',
            data: data,
            options: options
        });

        console.log(graph);
      } else {
        for (var i = 0; i < data.length; i++) {
          graph.segments[i].value = data[i].value;
        }
      }
      //graph.update();
    }
  });
}
