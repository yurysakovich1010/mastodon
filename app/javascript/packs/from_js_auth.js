import ready from '../mastodon/ready';

ready(() => {
  const params_tmp = location.hash.substr(1).split('&');
  const params = {};

  params_tmp.forEach((val) => {
    const splitter = val.split('=');
    params[splitter[0]] = splitter[1];
  });

  window.location = '/auth/auth/brighteon/callback?access_token=' + params.access_token;
});
