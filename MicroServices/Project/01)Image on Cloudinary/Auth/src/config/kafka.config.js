const { Kafka, Partitioners } = require('kafkajs');

const kafka = new Kafka({
  clientId: 'auth-service',
  brokers: ['localhost:9092'],
  retry: {
    initialRetryTime: 100,
    retries: 8,
  },
});
const producer = kafka.producer({
  createPartitioner: Partitioners.LegacyPartitioner,
});
const consumer = kafka.consumer({ groupId: 'auth-service-group' });

const initializeKafka = async () => {
  try {
    await producer.connect();
    await consumer.connect();
    await consumer.subscribe({ topic: 'user-image-events', fromBeginning: true });
    await consumer.subscribe({ topic: 'user-status-updates', fromBeginning: true });

    console.log('Kafka producer and consumer initialized');
    return { producer, consumer };
  } catch (error) {
    console.error('Error initializing Kafka:', error);
    throw error;
  }
};

module.exports = { initializeKafka, producer, consumer };

// Express service error handling
const gracefulShutdown = async () => {
  try {
    await producer.disconnect();
    await consumer.disconnect();
    console.log('Kafka connections closed');
  } catch (error) {
    console.error('Error during shutdown:', error);
  }
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);
