import React from 'react';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import Avatar from '../../../components/avatar';
import Icon from '../../../components/icon';
import ImmutablePureComponent from 'react-immutable-pure-component';
import SearchContainer from 'mastodon/features/ui/components/search_container';
import SearchResultsContainer from 'mastodon/features/ui/components/search_results_container';
import horizontalLogo from 'mastodon/../images/brighteon-social/logo_horiz.png';
import { isMobile } from 'mastodon/is_mobile';
import Notifications from "../../notifications";

import { connect } from 'react-redux';
import IconWithBadge from 'mastodon/components/icon_with_badge';
import {createSelector} from "reselect";
import {List as ImmutableList} from "immutable";
import {cleanNotifications, expandNotifications} from "../../../actions/notifications";

const getNotifications = createSelector([
  state => state.getIn(['settings', 'notifications', 'quickFilter', 'show']),
  state => state.getIn(['settings', 'notifications', 'quickFilter', 'active']),
  state => ImmutableList(state.getIn(['settings', 'notifications', 'shows']).filter(item => !item).keys()),
  state => state.getIn(['notifications', 'items']),
], (showFilterBar, allowedType, excludedTypes, notifications) => {
  if (!showFilterBar || allowedType === 'all') {
    // used if user changed the notification settings after loading the notifications from the server
    // otherwise a list of notifications will come pre-filtered from the backend
    // we need to turn it off for FilterBar in order not to block ourselves from seeing a specific category
    return notifications.filter(item => item !== null)
      .filter(item => item.get('read') !== true)
      .filterNot(item => excludedTypes.includes(item.get('type')));
  }
  return notifications.filter(item => item !== null)
    .filter(item => item.get('read') !== true)
    .filter(item => allowedType === item.get('type'));
});

const mapStateToProps = state => ({
  count: getNotifications(state).size,
  id: 'bell',
});

const NotificationsCounterIcon = connect(mapStateToProps)(IconWithBadge);

class NavigationBar extends ImmutablePureComponent {

  static propTypes = {
    account: ImmutablePropTypes.map.isRequired,
    onLogout: PropTypes.func.isRequired,
    onClose: PropTypes.func,
    fetchNotifications: PropTypes.func,
  };

  state = {
    popupVisible: false,
  };

  toggleNotificationsPopup = (e) => {
    e.stopPropagation();
    this.setState({popupVisible: !this.state.popupVisible});
  };

  closeNotificationsPopup = () => {
    this.setState({popupVisible: false});
  };

  markAsRead = () => {
    if (this.props.count > 0) {
      this.props.cleanNotifications();
      this.props.fetchNotifications();
    }
  };

  componentDidMount() {
    this.props.fetchNotifications();
  }

  render () {
    const avatarStyle = {
      borderRadius: '50%',
      border: '2px solid white',
    };

    const deviceIsMobile = isMobile(window.innerWidth);

    return (
      <div className='navigation-bar'>
        <div className='navigation-bar__inner'>
          <div className='d-flex'>
            <div className='head-logo'>
              <a href='/' >
                <img src={horizontalLogo} style={{width: '100%'}}/>
              </a>
            </div>

            {
              !deviceIsMobile && (
                <div className='search-container flex-fill'>
                  <SearchContainer />

                  <SearchResultsContainer />
                </div>
              )
            }

            <div className='spacer' />

            <div className='d-flex'>
              <a href='https://support.brighteon.com/donate.html' className='decoration-none'>
                <button className='donate standard mr3'>
                  Donate
                </button>
              </a>

              <a href='/' className='decoration-none'>
                <div className='icon mr2'>
                  <Icon id='home' fixedWidth />
                </div>
              </a>

              <div className='notification-bell'>
                {/*<a target='_blank' rel='noopener noreferrer' href='/web/notifications' className='decoration-none'>*/}
                  <div className='icon mr2' onClick={this.toggleNotificationsPopup}>
                    <NotificationsCounterIcon className='column-link__icon' />
                  </div>
                {/*</a>*/}

                {
                  this.state.popupVisible && (
                    <div className="drawer__pager">
                      <div className="drawer__inner darker">
                        <button className="mark_as_read" onClick={this.markAsRead}>
                          Mark all as read
                        </button>
                        <Notifications onPopup />
                      </div>
                    </div>
                  )
                }

              </div>

              <a href='/settings/preferences' className='decoration-none'>
                <div className='icon mr2'>
                  <Icon id='gear' fixedWidth />
                </div>
              </a>

              <a target='_blank' rel='noopener noreferrer' href={this.props.account.get('url')}>
                <span style={{ display: 'none' }}>{this.props.account.get('acct')}</span>
                <Avatar account={this.props.account} size={36} style={avatarStyle} />
              </a>
            </div>
          </div>

          {
            deviceIsMobile && (
              <div className='mobile-search-container'>
                <SearchContainer />

                <SearchResultsContainer />
              </div>
            )
          }

          {/*<div className='navigation-bar__profile'>*/}
            {/*<Permalink href={this.props.account.get('url')} to={`/accounts/${this.props.account.get('id')}`}>*/}
              {/*<strong className='navigation-bar__profile-account'>@{this.props.account.get('acct')}</strong>*/}
            {/*</Permalink>*/}

            {/*<a href='/settings/profile' className='navigation-bar__profile-edit'><FormattedMessage id='navigation_bar.edit_profile' defaultMessage='Edit profile' /></a>*/}
          {/*</div>*/}

          {/*<div className='navigation-bar__actions'>*/}
            {/*<IconButton className='close' title='' icon='close' onClick={this.props.onClose} />*/}
            {/*<ActionBar account={this.props.account} onLogout={this.props.onLogout} />*/}
          {/*</div>*/}
        </div>
      </div>
    );
  }
}

const mapDispatchToProps = (dispatch) => ({
  fetchNotifications() {
    dispatch(expandNotifications());
  },
  cleanNotifications() {
    dispatch(cleanNotifications());
  }
});

export default connect(mapStateToProps, mapDispatchToProps)(NavigationBar);
