export const config = () => ({
  rabbitMQConfig: {
    urls: [process.env.RABBITMQ_URL],
    queue: `AGENT.${process.env.SERVER_NAME}`,
    queueOptions: {
      durable: true,
    },
  },
});
