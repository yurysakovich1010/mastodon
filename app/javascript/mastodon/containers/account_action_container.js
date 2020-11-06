import React from 'react';
import { Provider } from 'react-redux';
import PropTypes from 'prop-types';
import configureStore from '../store/configureStore';
import { hydrateStore } from '../actions/store';
import { IntlProvider, addLocaleData } from 'react-intl';
import { getLocale } from '../locales';
import AccountAction from '../components/account_action_container';
import initialState from '../initial_state';
import { fetchCustomEmojis } from '../actions/custom_emojis';

const { localeData, messages } = getLocale();
addLocaleData(localeData);

const store = configureStore();

if (initialState) {
  store.dispatch(hydrateStore(initialState));
}

store.dispatch(fetchCustomEmojis());

export default class AccountActionContainer extends React.PureComponent {

  static propTypes = {
    locale: PropTypes.string.isRequired,
    accountId: PropTypes.string.isRequired,
  };

  render () {
    const { locale, accountId } = this.props;

    return (
      <IntlProvider locale={locale} messages={messages}>
        <Provider store={store}>
          <AccountAction accountId={accountId} />
        </Provider>
      </IntlProvider>
    );
  }

}
