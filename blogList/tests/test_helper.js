const Blog = require("../models/blog");

const initialBlogs = [
  {
    title: "La Quinta Monataña",
    author: "Paulo Cohelo",
    url: "nomelase.com",
    likes: 666,
  },
  {
    title: "El Alquimista",
    author: "Paulo Cohelo",
    url: "nomelase.com",
    likes: 100,
  },
];

const nonExistingId = async () => {
  const blog = new Blog({ title: "willremovethissoon" });
  await blog.save();
  await blog.deleteOne();

  return blog._id.toString();
};

const blogsInDb = async () => {
  const blogs = await Blog.find({});
  return blogs.map((blog) => blog.toJSON());
};

module.exports = {
  initialBlogs,
  nonExistingId,
  blogsInDb,
};
