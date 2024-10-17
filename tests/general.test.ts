import request from "supertest";
import app from "..";  // Adjust the path if necessary
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

describe('GeneralRoute', () => {
    let mongoServer: MongoMemoryServer;

    beforeAll(async () => {
      mongoServer = await MongoMemoryServer.create();
      const uri = mongoServer.getUri();

      // Disconnect from any existing connection before establishing a new one
      if (mongoose.connection.readyState !== 0) {
        await mongoose.disconnect();
      }
      
      await mongoose.connect(uri);
    });
  
    afterAll(async () => {
      await mongoose.disconnect();
      await mongoServer.stop();
    });
  
    it('Should return site details', async () => {
        const res = await request(app).get("/api/v7/general/site-detail");
        expect(res.statusCode).toBe(200);
        const respBody = res.body;
        expect(respBody).toHaveProperty('status', 'success');
        expect(respBody).toHaveProperty('message', 'Site Details Fetched');
        
        const expectedKeys: string[] = ["name", "email", "phone", "address", "fb", "tw", "wh", "ig"];
        for (const key of expectedKeys) {
          expect(Object.keys(respBody.data)).toContain(key);
        }
    });

    afterEach(async () => {
      // Ensure to close the connection after each test if necessary
      await mongoose.connection.close();
    });
});

// Set Jest timeout to handle longer MongoDB operations
jest.setTimeout(10000)