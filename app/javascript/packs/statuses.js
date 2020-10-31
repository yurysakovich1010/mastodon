import loadPolyfills from '../mastodon/load_polyfills';
import { start } from '../mastodon/common';

start();

function loaded() {
  const AccountTimelineContainer = require('../mastodon/containers/account_timeline_container').default;
  const React             = require('react');
  const ReactDOM          = require('react-dom');
  const mountNode         = document.getElementById('mastodon-statuses');

  if (mountNode !== null) {
    const props = JSON.parse(mountNode.getAttribute('data-props'));
    ReactDOM.render(<AccountTimelineContainer {...props} />, mountNode);
  }

  const mountNodeForPinnedStatuses = document.getElementById('mastodon-pinned-statuses');

  if (mountNodeForPinnedStatuses !== null) {
    const props = JSON.parse(mountNodeForPinnedStatuses.getAttribute('data-props'));
    ReactDOM.render(<AccountTimelineContainer {...props} pinned />, mountNodeForPinnedStatuses);
  }

  const mountNodeForUnpinnedStatuses = document.getElementById('mastodon-unpinned-statuses');

  if (mountNodeForUnpinnedStatuses !== null) {
    const props = JSON.parse(mountNodeForUnpinnedStatuses.getAttribute('data-props'));
    ReactDOM.render(<AccountTimelineContainer {...props} unpinned />, mountNodeForUnpinnedStatuses);
  }
}

function main() {
  const ready = require('../mastodon/ready').default;
  ready(loaded);
}

loadPolyfills().then(main).catch(error => {
  console.error(error);
});
