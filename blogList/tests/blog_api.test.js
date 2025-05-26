const { test, beforeEach, after, before } = require("node:test");
const assert = require("node:assert");
const supertest = require("supertest");

const helper = require("./test_helper");
const { app, connectDB } = require("../app");
const api = supertest(app);

const Blog = require("../models/blog");
const mongoose = require("mongoose");

before(async () => {
  await connectDB();
});

beforeEach(async () => {
  await Blog.deleteMany({});

  for (let blog of helper.initialBlogs) {
    let blogObject = new Blog(blog);
    await blogObject.save();
  }
});

test("the unique identifier is named 'id'", async () => {
  const response = await api.get("/api/blogs");
  const blogs = response.body;

  for (let blog of blogs) {
    assert.ok(blog.id);
    assert.strictEqual(blog._id, undefined);
  }
});

test("all blogs are returned", async () => {
  const response = await api.get("/api/blogs");

  assert.strictEqual(response.body.length, helper.initialBlogs.length);
});

test("a valid blog can be added", async () => {
  const initialBlogs = await helper.blogsInDb(); // Reutilizamos la función del helper

  const newBlog = {
    title: "Canonical string reduction",
    author: "Edsger W. Dijkstra",
    url: "http://www.cs.utexas.edu/~EWD/transcriptions/EWD08xx/EWD808.html",
    likes: 12,
  };

  await api
    .post("/api/blogs")
    .send(newBlog)
    .expect(201)
    .expect("Content-Type", /application\/json/);

  const blogsAfterPost = await helper.blogsInDb();
  assert.strictEqual(blogsAfterPost.length, initialBlogs.length + 1);

  const titles = blogsAfterPost.map((blog) => blog.title);
  assert.ok(titles.includes("Canonical string reduction"));
});

test("if likes property is missing, it defaults to 0", async () => {
  const newBlog = {
    title: "The unknown blog",
    author: "Anonymous",
    url: "http://localhost:3003/blogs/unknown",
  };

  await api
    .post("/api/blogs")
    .send(newBlog)
    .expect(201)
    .expect("Content-Type", /application\/json/);

  const blogsAfterPost = await helper.blogsInDb();
  const addedBlog = blogsAfterPost.find(
    (blog) => blog.title === "The unknown blog"
  );

  assert.strictEqual(addedBlog.likes, 0);
});

test("if title or url is missing, returns 400 Bad Request", async () => {
  // Caso 1: Falta title
  let newBlog = {
    author: "Someone",
    url: "http://localhost:3003/blogs/example",
    likes: 5,
  };

  let response = await api
    .post("/api/blogs")
    .send(newBlog)
    .expect(400)
    .expect("Content-Type", /application\/json/);

  assert.ok(response.body.error.includes("title"));

  // Caso 2: Falta url
  newBlog = {
    title: "No URL here",
    author: "Someone else",
    likes: 2,
  };

  response = await api
    .post("/api/blogs")
    .send(newBlog)
    .expect(400)
    .expect("Content-Type", /application\/json/);

  assert.ok(response.body.error.includes("url"));
});

after(async () => {
  await mongoose.connection.close();
});
