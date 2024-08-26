const { add } = require('../services/auth');
const { jwtEncode, tryCatch } = require('../../common/constant');
const { verfiyGithub, githubUrl, githubUserDeatil } = require('../../api.service');

exports.social = tryCatch((req, res) => {
  const { social } = req.params;
  switch (social) {
    case 'github':
      res.send({
        url: githubUrl(),
      });
      break;
    case 'google':
      res.send(social);
      break;
    case 'facebook':
      res.send(social);
      break;
    default:
      return res.status(400).send({ notFound: true, invalidSocial: true });
  }
});

exports.socialVerify = tryCatch(async (req, res) => {
  const { social } = req.params;
  const { code } = req.body;
  let token = null;

  const getGitUserPayload = (details) => {
    debugger;
    return {
      isSocial: true,
      email: details.email,
      name: details.name,
      profilePicture: details.avatar_url,
    };
  };

  switch (social) {
    case 'github':
      if (!code) res.send('!code not found');
      let { access_token, ...rest } = await verfiyGithub(code);
      if (access_token) {
        let gitUserDeatils = await githubUserDeatil(access_token);
        if (!gitUserDeatils?.email) throw 'Please first add your email in your github profile before continue';
        let userDeatils = await add(getGitUserPayload(gitUserDeatils));
        token = jwtEncode(userDeatils);
        res.cookie('jwt', token);
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
});
