export default () => ({
  port: parseInt(process.env.PORT, 10) || 8080,
  client: process.env.CLIENT_URL || 'http://localhost:3000',
  database: {
    uri: process.env.MONGO_URI,
  },
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN || '1h',
  },
});
