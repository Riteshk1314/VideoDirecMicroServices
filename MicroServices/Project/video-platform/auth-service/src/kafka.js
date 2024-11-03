
const { Kafka } = require('kafkajs');

const kafka = new Kafka({
  clientId: 'auth-service',  
  brokers: ['localhost:9092'],
});

const producer = kafka.producer();
const consumer = kafka.consumer({ groupId: '0002' });

module.exports = { producer, consumer };
