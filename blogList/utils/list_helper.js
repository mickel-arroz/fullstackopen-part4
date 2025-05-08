const dummy = (blogs) => {
  console.log("blogs?", blogs !== undefined);

  return 1;
};

const totalLikes = (blogs) => {
  return blogs.reduce((sum, blog) => sum + blog.likes, 0);
};

module.exports = {
  dummy,
  totalLikes,
};
