import loadPolyfills from '../mastodon/load_polyfills';
import { start } from '../mastodon/common';

start();

function loaded() {
  const UnsignedNavigationContainer = require('../mastodon/containers/unsigned_navigation_container').default;
  const React = require('react');
  const ReactDOM = require('react-dom');
  const mountNode = document.getElementById('mastodon-unsigned-navigation');

  if (mountNode !== null) {
    const props = JSON.parse(mountNode.getAttribute('data-props'));
    ReactDOM.render(<UnsignedNavigationContainer {...props} />, mountNode);
  }
}

function main() {
  const ready = require('../mastodon/ready').default;
  ready(loaded);
}

loadPolyfills().then(main).catch(error => {
  console.error(error);
});
