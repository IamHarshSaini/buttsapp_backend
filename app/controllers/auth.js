const services = require("../services/auth");
const { jwtEncode } = require("../../common/constant");

const {
  verfiyGithub,
  githubUrl,
  githubUserDeatil,
} = require("../../api.service");

const controller = {
  get: async function (req, res) {
    try {
      const users = await services.get(req);
      res.send(users);
    } catch (error) {
      res.send(error);
    }
  },
  register: async function (req, res) {
    try {
      // return services.add(req);
    } catch (error) {
      return error;
    }
  },
  login: async function (req, res) {
    try {
    } catch (error) {
      return error;
    }
  },
  social: async function (req, res) {
    try {
      const { social } = req.params;
      switch (social) {
        case "github":
          res.send({
            url: githubUrl(),
          });
          break;
        case "google":
          res.send(social);
          break;
        case "facebook":
          res.send(social);
          break;
        default:
          return res.status(400).send({ notFound: true, invalidSocial: true });
      }
    } catch (error) {
      res.send(error);
    }
  },
  socialVerify: async function (req, res) {
    try {
      const { social } = req.params;
      const { code } = req.body;
      let token = null;

      switch (social) {
        case "github":
          if (!code) res.send("!code not found");
          let { access_token, ...rest } = await verfiyGithub(code);
          if (access_token) {
            let gitUserDeatils = await githubUserDeatil(access_token);
            if (!gitUserDeatils?.email)
              throw "Please first add your email in your github profile before continue";
            let userDeatils = await services.add({
              body: getGitUserPayload(gitUserDeatils),
            });
            token = jwtEncode(userDeatils);
            res.cookie("jwt", token);
            res.send({
              token,
            });
          } else {
            res.send(rest);
          }
          break;
        default:
          return res.status(400).send({ notFound: true, invalidSocial: true });
      }
    } catch (error) {
      res.send({ error: error });
    }
  },
};

const getGitUserPayload = (details) => {
  return {
    isSocial: true,
    email: details.email,
    userName: details.name,
    avatar: details.avatar_url,
  };
};

module.exports = controller;
