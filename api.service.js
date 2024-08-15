const axios = require("axios");

// Add a request interceptor
axios.interceptors.request.use(
  function (config) {
    return config;
  },
  function (error) {
    return Promise.reject(error);
  }
);

// Add a response interceptor
axios.interceptors.response.use(
  function (response) {
    return response?.data;
  },
  function (error) {
    return Promise.reject(error);
  }
);

exports.githubUrl = function () {
  return `https://github.com/login/oauth/authorize?client_id=${process.env.GITHUB_C_ID}`;
};

exports.verfiyGithub = async (code) => {
  return await axios.post(
    "https://github.com/login/oauth/access_token",
    {
      client_id: process.env.GITHUB_C_ID,
      client_secret: process.env.GITHUB_C_SEC,
      code: code,
    },
    {
      headers: {
        Accept: "application/json",
      },
    }
  );
};

exports.githubUserDeatil = async function (accessToken) {
  return await axios.get("https://api.github.com/user", {
    headers: {
      Authorization: `token ${accessToken}`,
    },
  });
};
