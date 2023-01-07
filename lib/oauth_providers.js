const fetch = require('node-fetch');
const { pick } = require('lodash');
const jwt = require('jsonwebtoken');
const config = require('../config');

const oauthProviders = {
  google: {
    url: 'https://accounts.google.com/o/oauth2/v2/auth',
    scope: 'openid email profile',
    getUser: async (app, query) => {
      const oauthConfig = app.oauth.google;

      const providerUser = jwt.decode(
        (
          await (
            await fetch('https://oauth2.googleapis.com/token', {
              method: 'POST',
              code: query.code,
              body: JSON.stringify({
                client_id: oauthConfig.client_id,
                client_secret: oauthConfig.client_secret,
                grant_type: 'authorization_code',
                redirect_uri: `${config.server_url}/users/oauth`,
              }),
              headers: { 'Content-Type': 'application/json' },
            })
          ).json()
        ).id_token
      );

      return {
        ...pick(providerUser, ['name', 'email']),
        avatar: providerUser.picture,
        provider: 'google',
        providerId: providerUser.sub,
      };
    },
  },
  github: {
    url: 'https://github.com/login/oauth/authorize',
    scope: 'read:user user:email',
    getUser: async (app, query) => {
      const oauthConfig = app.oauth.github;

      const accessToken = new URLSearchParams(
        await (
          await fetch('https://github.com/login/oauth/access_token', {
            method: 'POST',
            body: new URLSearchParams({
              code: query.code,
              client_id: oauthConfig.client_id,
              client_secret: oauthConfig.client_secret,
            }),
          })
        ).text()
      ).get('access_token');

      const providerUser = await (
        await fetch('https://api.github.com/user', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `token ${accessToken}`,
          },
        })
      ).json();

      if (!providerUser.providerId) {
        throw new Error('bad response from github');
      }

      return {
        ...pick(providerUser, ['name', 'email']),
        avatar: providerUser.avatar_url,
        provider: 'github',
        providerId: providerUser.id,
      };
    },
  },
  facebook: {
    url: 'https://www.facebook.com/v6.0/dialog/oauth',
    scope: 'email',
    getUser: async (app, query) => {
      const oauthConfig = app.oauth.facebook;

      const accessToken = (
        await (
          await fetch(
            `https://graph.facebook.com/v6.0/oauth/access_token?${new URLSearchParams(
              {
                code: query.code,
                client_id: oauthConfig.client_id,
                client_secret: oauthConfig.client_secret,
                redirect_uri: `${config.server_url}/users/oauth`,
              }
            )}`
          )
        ).json()
      ).access_token;

      const providerUser = await (
        await fetch(
          `https://graph.facebook.com/v6.0/me?${new URLSearchParams({
            access_token: accessToken,
            fields: 'id,name,email,picture',
            format: 'json',
            method: 'get',
            pretty: '0',
          })}`
        )
      ).json();

      if (!providerUser.email) {
        throw new Error('Facebook email not verified');
      }

      return {
        ...pick(providerUser, ['name', 'email']),
        avatar: providerUser.picture?.data?.url,
        provider: 'facebook',
        providerId: providerUser.id,
      };
    },
  },
  amazon: {
    url: 'https://www.amazon.com/ap/oa',
    scope: 'profile',
    getUser: async (app, query) => {
      const oauthConfig = app.oauth.amazon;

      const accessToken = (
        await (
          await fetch('https://api.amazon.com/auth/o2/token', {
            method: 'POST',
            body: new URLSearchParams({
              code: query.code,
              client_id: oauthConfig.client_id,
              client_secret: oauthConfig.client_secret,
              redirect_uri: `${config.server_url}/users/oauth`,
              grant_type: 'authorization_code',
            }),
          })
        ).json()
      ).access_token;

      const providerUser = await (
        await fetch(
          `https://api.amazon.com/user/profile?${new URLSearchParams({
            access_token: accessToken,
          })}`
        )
      ).json();

      return {
        ...pick(providerUser, ['name', 'email']),
        provider: 'amazon',
        providerId: providerUser.user_id,
      };
    },
  },
  microsoft: {
    url: 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize',
    scope: 'email openid profile',
    additionalRedirProps: { response_mode: 'query' },
    getUser: async (app, query) => {
      const oauthConfig = app.oauth.microsoft;

      const accessToken = (
        await (
          await fetch(
            'https://login.microsoftonline.com/common/oauth2/v2.0/token ',
            {
              method: 'POST',
              body: new URLSearchParams({
                code: query.code,
                client_id: oauthConfig.client_id,
                client_secret: oauthConfig.client_secret,
                redirect_uri: `${config.server_url}/users/oauth`,
                grant_type: 'authorization_code',
              }),
            }
          )
        ).json()
      ).id_token;

      const providerUser = jwt.decode(accessToken);

      return {
        ...pick(providerUser, ['name', 'email']),
        provider: 'microsoft',
        providerId: providerUser.sub,
      };
    },
  },
};

function getRedirUrl(oauthConfig, providerName, state) {
  const providerLib = oauthProviders[providerName];

  return `${providerLib.url}?${new URLSearchParams({
    response_type: 'code',
    client_id: oauthConfig.client_id,
    redirect_uri: `${config.server_url}/users/oauth`,
    state,
    o2v: '1',
    scope: providerLib.scope,
    ...providerLib.additionalRedirProps,
  })}`;
}

module.exports = {
  oauthProviders,
  getRedirUrl,
};
