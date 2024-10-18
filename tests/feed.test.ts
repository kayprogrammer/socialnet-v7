import request from "supertest";
import app from "..";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import { BASE_URL, testPost } from "./utils";
import { IPost } from "../models/feed";
import { convertSchemaData } from "../config/utils";
import { PostSchema } from "../schemas/feed";

describe('FeedRoutes', () => {
  let mongoServer: MongoMemoryServer;
  let baseUrl: string = `${BASE_URL}/feed`
  let post: IPost

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);

    post = await testPost()
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  it('Should return latest posts', async () => {
    const res = await request(app).get(`${baseUrl}/posts`);
    expect(res.statusCode).toBe(200);
    const respBody = res.body;
    expect(respBody).toMatchObject({
      status: "success",
      message: "Posts fetched",
      data: {
        itemsCount: 1,
        itemsPerPage: 100, 
        page: 1, 
        posts: [convertSchemaData(PostSchema, post)], 
        totalPages: 1
      }
    });
  });
});