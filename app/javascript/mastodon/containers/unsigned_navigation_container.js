import React from 'react';
import { Provider } from 'react-redux';
import PropTypes from 'prop-types';
import { IntlProvider } from 'react-intl';
import { BrowserRouter } from 'react-router-dom';
import configureStore from '../store/configureStore';
import { hydrateStore } from '../actions/store';
import initialState from '../initial_state';
import UnsignedNavigationBar from '../components/unsigned_navigation_bar';

const store = configureStore();

if (initialState) {
  store.dispatch(hydrateStore(initialState));
}

export default class UnsignedNavigationContainer extends React.PureComponent {

  static propTypes = {
    locale: PropTypes.string.isRequired,
  };

  render () {
    const { locale } = this.props;

    return (
      <IntlProvider locale={locale}>
        <Provider store={store}>
          <BrowserRouter basename='/web'>
            <UnsignedNavigationBar />
          </BrowserRouter>
        </Provider>
      </IntlProvider>
    );
  }

}
