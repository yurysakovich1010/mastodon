import loadPolyfills from '../mastodon/load_polyfills';
import { start } from '../mastodon/common';
import { Provider } from 'react-redux';
import { IntlProvider } from 'react-intl';
import configureStore from '../mastodon/store/configureStore';
import initialState from '../mastodon/initial_state';
import { hydrateStore } from '../mastodon/actions/store';
import { fetchCustomEmojis } from '../mastodon/actions/custom_emojis';
import { BrowserRouter } from 'react-router-dom';

start();

const store = configureStore();

if (initialState) {
  store.dispatch(hydrateStore(initialState));
}

store.dispatch(fetchCustomEmojis());

function loaded() {
  const NavigationContainer = require('../mastodon/features/compose/containers/navigation_container').default;
  const React = require('react');
  const ReactDOM = require('react-dom');
  const mountNode = document.getElementById('mastodon-navigation');

  if (mountNode !== null) {
    const props = JSON.parse(mountNode.getAttribute('data-props'));
    ReactDOM.render((
      <IntlProvider locale={props.locale}>
        <Provider store={store}>
          <BrowserRouter basename='/web'>
            <NavigationContainer />
          </BrowserRouter>
        </Provider>
      </IntlProvider>), mountNode);
  }
}

function main() {
  const ready = require('../mastodon/ready').default;
  ready(loaded);
}

loadPolyfills().then(main).catch(error => {
  console.error(error);
});
