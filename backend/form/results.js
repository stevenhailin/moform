const AWS = require('aws-sdk');

const dynamoDb = new AWS.DynamoDB.DocumentClient();

let generateHtml = function(data) {
  let formsData = JSON.stringify(data);
  return `
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport"
        content="width=device-width, user-scalable=no, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="ie=edge">
  <title>表单数据</title>
  <link href="https://cdn.bootcss.com/font-awesome/4.7.0/css/font-awesome.css" rel="stylesheet">
  <link href="https://cdn.bootcss.com/bootstrap/4.0.0-beta.2/css/bootstrap.min.css" rel="stylesheet">
  <link href="https://cdn.bootcss.com/datatables/1.10.16/css/jquery.dataTables.min.css" rel="stylesheet">
  <link href="https://cdn.datatables.net/buttons/1.4.2/css/buttons.dataTables.min.css" rel="stylesheet">
</head>
<body>
<!-- Navigation -->
<nav class="navbar navbar-light bg-light static-top">
  <div class="container">
    <a class="navbar-brand" href="#">表单</a>
    <a class="btn btn-primary" href="#">登录</a>
  </div>
</nav>

<div class="container">
  <table id="results" class="display" width="100%"></table>
</div>


<script src="https://cdn.bootcss.com/jquery/3.2.1/jquery.min.js"></script>
<script src="https://cdn.bootcss.com/popper.js/1.12.9/umd/popper.min.js"></script>
<script src="https://cdn.bootcss.com/bootstrap/4.0.0-beta.2/js/bootstrap.min.js"></script>
<script src="https://cdn.bootcss.com/jquery-ui-bootstrap/0.5pre/assets/js/jquery-ui-1.10.0.custom.min.js"></script>
<script src="https://cdn.pho.im/js/form-render.min.js"></script>
<script src="https://cdn.bootcss.com/datatables/1.10.16/js/jquery.dataTables.min.js"></script>

<script src="https://cdn.datatables.net/buttons/1.4.2/js/dataTables.buttons.min.js"></script>
<script src="//cdn.datatables.net/buttons/1.4.2/js/buttons.flash.min.js"></script>
<script src="https://cdn.bootcss.com/jszip/3.1.5/jszip.min.js"></script>
<script src="//cdn.datatables.net/buttons/1.4.2/js/buttons.html5.min.js"></script>
<script src="//cdn.datatables.net/buttons/1.4.2/js/buttons.print.min.js"></script>
<script>
$(document).ready(function () {
  var parsedFormsData = ${formsData};
  var dataSet = [];
  var columns = [];
  for (var i = 0; i < parsedFormsData.length; i++) {
    var formData = JSON.parse(parsedFormsData[i].formData).formData;
    var formArray = [];
    for (var j = 0; j < formData.length; j++) {
      formArray.push(formData[j].value)
    }
    dataSet.push(formArray)
  }

  let formInfo = JSON.parse(parsedFormsData[0].formData).formInfo;
  for (var i = 0; i < formInfo.length; i++) {
    var fieldInfo = formInfo[i];
    console.log(fieldInfo.type)
    if (fieldInfo.type !== 'header' && fieldInfo.type !== 'hidden' && fieldInfo.type !== 'paragraph') {
      columns.push({
        title: fieldInfo.label
      })
    }
  }

  console.log(dataSet, columns)
  $('#results').DataTable({
    "language": {
      "url": "https://cdn.datatables.net/plug-ins/1.10.16/i18n/Chinese.json"
    },
    dom: 'Bfrtip',
    buttons: [
      'copy', 'csv', 'excel', 'print'
    ],
    data: dataSet,
    columns: columns
  });
});
</script>
</body>
</html>
`
}

module.exports.handler = (event, context, callback) => {
  let formId = event.pathParameters.formId;
  const params = {
    TableName: process.env.FORM_DATA_DYNAMODB_TABLE,
    FilterExpression: 'formId = :formId',
    ExpressionAttributeValues: {
      ':formId': formId,
    }
  };

  dynamoDb.scan(params, (error, result) => {
    if (error) {
      console.error(error);
      callback(null, {
        statusCode: error.statusCode || 501,
        headers: { 'Content-Type': 'text/plain' },
        body: 'couldn\'t fetch the logs.',
      });
      return;
    }

    const response = {
      statusCode: 200,
      headers: {'Content-Type': 'text/html'},
      body: generateHtml(result.Items),
    };
    callback(null, response);
  });
};
