import React from 'react';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import ActionBar from './action_bar';
import Avatar from '../../../components/avatar';
import Permalink from '../../../components/permalink';
import Icon from '../../../components/icon';
import IconButton from '../../../components/icon_button';
import { FormattedMessage } from 'react-intl';
import ImmutablePureComponent from 'react-immutable-pure-component';
import SearchContainer from 'mastodon/features/ui/components/search_container';
import horizontalLogo from 'mastodon/../images/brighteon-social/logo_horiz.png';
import { isMobile } from 'mastodon/is_mobile';

export default class NavigationBar extends ImmutablePureComponent {

  static propTypes = {
    account: ImmutablePropTypes.map.isRequired,
    onLogout: PropTypes.func.isRequired,
    onClose: PropTypes.func,
  };

  render () {
    const avatarStyle = {
      borderRadius: '50%',
      border: '2px solid white',
    }

    const deviceIsMobile = isMobile(window.innerWidth);

    return (
      <div className='navigation-bar'>
        <div className='navigation-bar__inner'>
          <div className='d-flex'>
            <div className='head-logo'>
              <img src={horizontalLogo} style={{width: '100%'}}/>
            </div>

            {
              !deviceIsMobile && (
                <div className='search-container flex-fill'>
                  <SearchContainer />
                </div>
              )
            }

            <div className='spacer' />

            <div className='d-flex'>
              <button className='donate mr3'>
                Donate
              </button>

              <a target='_blank' rel='noopener noreferrer' href='/landing' className='decoration-none'>
                <div className='icon mr2'>
                  <Icon id='home' fixedWidth />
                </div>
              </a>

              <a target='_blank' rel='noopener noreferrer' href='/web/notifications' className='decoration-none'>
                <div className='icon mr2'>
                  <Icon id='bell' fixedWidth />
                </div>
              </a>

              <a target='_blank' rel='noopener noreferrer' href='/settings/preferences' className='decoration-none'>
                <div className='icon mr2'>
                  <Icon id='gear' fixedWidth />
                </div>
              </a>

              <a target='_blank' rel='noopener noreferrer' href='/settings/profile'>
                <span style={{ display: 'none' }}>{this.props.account.get('acct')}</span>
                <Avatar account={this.props.account} size={36} style={avatarStyle} />
              </a>
            </div>
          </div>

          {
            deviceIsMobile && (
              <div className='mobile-search-container'>
                <SearchContainer />
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
