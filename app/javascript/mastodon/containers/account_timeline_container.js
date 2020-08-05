import React, { Fragment } from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import PropTypes from 'prop-types';
import configureStore from '../store/configureStore';
import { hydrateStore } from '../actions/store';
import { IntlProvider, addLocaleData } from 'react-intl';
import { getLocale } from '../locales';
import AccountTimeline from '../features/standalone/account_timeline';
import HashtagTimeline from '../features/standalone/hashtag_timeline';
import ModalContainer from '../features/ui/containers/modal_container';
import initialState from '../initial_state';

const { localeData, messages } = getLocale();
addLocaleData(localeData);

const store = configureStore();

if (initialState) {
  store.dispatch(hydrateStore(initialState));
}

export default class AccountTimelineContainer extends React.PureComponent {

  static propTypes = {
    locale: PropTypes.string.isRequired,
    hashtag: PropTypes.string,
    local: PropTypes.bool,
    username: PropTypes.string,
    avatar: PropTypes.string,
    statusId: PropTypes.any,
  };

  static defaultProps = {
    local: !initialState.settings.known_fediverse,
  };

  render () {
    const { locale, hashtag, local, username, avatar, statusId } = this.props;

    let timeline;

    if (hashtag) {
      timeline = <HashtagTimeline hashtag={hashtag} local={local} />;
    } else {
      timeline = <AccountTimeline local={local} username={username} avatar={avatar} statusId={statusId} />;
    }

    return (
      <IntlProvider locale={locale} messages={messages}>
        <Provider store={store}>
          <Fragment>
            {timeline}

            {ReactDOM.createPortal(
              <ModalContainer />,
              document.getElementById('modal-container'),
            )}
          </Fragment>
        </Provider>
      </IntlProvider>
    );
  }

}
