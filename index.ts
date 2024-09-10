import express, { Application } from 'express';
import swaggerUi from 'swagger-ui-express';
import env from './config/config';
import connectDB from './config/db';
import generalRouter from './controllers/general';
import { siteDetailDocs } from './docs/general';

const swaggerDocument = {
  openapi: '3.0.0',
  info: {
      title: env.SITE_NAME,
      version: '7.0.0',
  },
  servers: [{ url: '/api/v7' }],
  paths: {
      '/general/site-detail': siteDetailDocs,
      // Other paths...
  },
  components: {
      // Security schemes, schemas, etc.
  },
};

const app: Application = express();

// Connect DB
connectDB()

// Register Routes
app.use("/api/v7/general", generalRouter)

app.use('/', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.listen(env.PORT, () => {
  console.log(`${env.SITE_NAME} server is running on port ${env.PORT}`);
  console.log(`Connected to MongoDB at ${env.MONGO_URI}`);
});

