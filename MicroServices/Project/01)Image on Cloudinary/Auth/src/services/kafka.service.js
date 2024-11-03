const { producer } = require('../config/kafka.config');

const sendUserEvent = async (eventType, userData) => {
  try {
    await producer.send({
      topic: 'user-events',
      messages: [
        {
          key: userData.id,
          value: JSON.stringify({
            eventType,
            timestamp: new Date().toISOString(),
            data: userData
          })
        }
      ]
    });
    console.log(`User event ${eventType} sent successfully`);
  } catch (error) {
    console.error('Error sending user event:', error);
    throw error;
  }
};


const startKafkaConsumer = async () => {
    const { consumer } = require('../config/kafka.config');
  
    await consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        const eventData = JSON.parse(message.value.toString());
        
        switch (topic) {
          case 'user-image-events':
            // Handle image upload events
            console.log(`Image event received for user ${eventData.userId}`);
            // Update user metadata if needed
            break;
            
          case 'user-status-updates':
            // Handle user status updates
            console.log(`Status update received: ${eventData.status}`);
            break;
        }
      }
    });
  };

module.exports = { sendUserEvent, startKafkaConsumer };