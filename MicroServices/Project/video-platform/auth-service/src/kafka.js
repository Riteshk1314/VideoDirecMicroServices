// src/kafka.js

const { Kafka } = require('kafkajs');

const kafka = new Kafka({
  clientId: 'auth-service', // e.g., 'auth-service'
  brokers: ['localhost:9092'],
});

const producer = kafka.producer();
const consumer = kafka.consumer({ groupId: '0002' }); // Unique for each service

module.exports = { producer, consumer };
