const jwt = require("jsonwebtoken");
const services = require("../services/auth");
// const { jwtDecode } = require("jwt-decode");

const {
  verfiyGithub,
  githubUrl,
  githubUserDeatil,
} = require("../../api.service");

const controller = {
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
            let userDeatils = await services.add({
              body: getGitUserPayload(gitUserDeatils),
            });
            token = createJwtToken(userDeatils);
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
    username: details.name,
    email: details.email,
    dp: details.avatar_url,
  };
};

const createJwtToken = (details) => {
  let token = jwt.sign(JSON.stringify(details), "shhhhh");
  return token;
};

module.exports = controller;
