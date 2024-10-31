// src/index.js

const express = require('express');
const mongoose = require('mongoose');
const { producer, consumer } = require('./kafka');

const app = express();
const PORT = 8000;
const DB_NAME = 'yourDatabaseName';  // Replace with your actual DB name

// Initialize Kafka producer and consumer
async function initKafka() {
  try {
    await producer.connect();
    await consumer.connect();

    // Subscribe to relevant topics and start consuming
    await consumer.subscribe({ topic: 'auth-events', fromBeginning: true });
    await consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        console.log(`Received message in ${topic}:`, message.value.toString());
        // Add logic to handle messages as needed
      },
    });
  } catch (error) {
    console.error("Error connecting to Kafka:", error);
    throw new Error("Kafka initialization failed");
  }
}

(async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(`${process.env.MONGO_URL}${DB_NAME}`, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    // Initialize Kafka
    await initKafka();

    // Start Express server
    app.on("error", (error) => console.error(`Express server error: ${error}`));
    app.listen(PORT, () => {
      console.log(`Server started at http://localhost:${PORT}`);
    });

  } catch (error) {
    console.error("Error during initialization:", error);
    throw new Error("Server initialization failed");
  }
})();
