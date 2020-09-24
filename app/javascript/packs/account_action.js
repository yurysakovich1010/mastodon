import loadPolyfills from '../mastodon/load_polyfills';
import { start } from '../mastodon/common';

start();

function loaded() {
  const AccountActionContainer = require('../mastodon/containers/account_action_container').default;
  const React = require('react');
  const ReactDOM = require('react-dom');
  const mountNode = document.getElementById('mastodon-account-action');

  if (mountNode !== null) {
    const props = JSON.parse(mountNode.getAttribute('data-props'));
    const accountId = JSON.parse(mountNode.getAttribute('data-account'));

    ReactDOM.render(<AccountActionContainer {...props} accountId={accountId.toString()} />, mountNode);
  }
}

function main() {
  const ready = require('../mastodon/ready').default;
  ready(loaded);
}

loadPolyfills().then(main).catch(error => {
  console.error(error);
});
