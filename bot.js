const botBuilder = require('claudia-bot-builder');
const slackTemplate = require('claudia-bot-builder').slackTemplate;
const AWS = require('aws-sdk');

const dynamodb = new AWS.DynamoDB.DocumentClient();

function displayList(items) {
  let itemStrings = [];

  for (let i=0; i < items.length; i++) {
    const itemString = `${items[i].name}: ${items[i].score}`;
    itemStrings.push(itemString);
  }

  let message = new slackTemplate(itemStrings.join('\n'));
  return message.channelMessage(true).get()
}

function getFromTable(itemName) {
  const itemKey = itemName.toLowerCase()

  return dynamodb.get({
    TableName: 'karma',
    Key: {
      name: itemKey
    }
  }).promise().then(function(data) {
    item = data.Item || {
      label: itemName,
      name: itemKey,
      score: 0,
      sortable: 'true'
    }

    return item;
  });
}

function giveKarma(item) {
  item.score += 1;
  return pushToTable(item).then(function() {
    return sendMessage(item);
  });
}

function pushToTable(item) {
  return dynamodb.put({
    TableName: 'karma',
    Item: item
  }).promise();
}

function query(sort) {
  return dynamodb.query({
    TableName: 'karma',
    IndexName: 'sortable-score-index',
    Limit: 5,
    KeyConditions: {
      sortable: {
        ComparisonOperator: 'EQ',
        AttributeValueList: ['true']
      }
    },
    ScanIndexForward: sort == 'bottom'
  }).promise().then(function(data) { return data.Items });
}

function sendMessage(item) {
  message = new slackTemplate(`${item.label} has ${item.score} karma.`);
  return message.channelMessage(true).get();
}

function takeKarma(item) {
  item.score -= 1;
  return pushToTable(item).then(function() {
    return sendMessage(item);
  });
}

function updateLabel(item, label) {
  const original_label = item.label;
  item.label = label;
  return pushToTable(item).then(function(item) {
    message = new slackTemplate(`${original_label} is now ${label}.`);
    return message.channelMessage(true).get();
  });
}

module.exports = botBuilder(function (request) {
  if (request.text.indexOf('give') === 0) {
    const item = request.text.replace(/^give\s/, '');
    return getFromTable(item).then(giveKarma);
  }

  if (request.text.indexOf('take') === 0) {
    const item = request.text.replace(/^take\s/, '');
    return getFromTable(item).then(takeKarma);
  }

  if (request.text.indexOf('top') === 0) {
    return query('top').then(displayList)
  }

  if (request.text.indexOf('bottom') === 0) {
    return query('bottom').then(displayList)
  }

  if (request.text.indexOf('update-label') === 0) {
    const label = request.text.replace(/^update\-label\s/, '');
    return getFromTable(label).then(function(item) {
      return updateLabel(item, label);
    });
  }

  return `Available commands for karma are top, bottom, give, and take ${request.text} ${request.text.match(/^give/) != -1}`
}, { platforms: ['slackSlashCommand'] });
