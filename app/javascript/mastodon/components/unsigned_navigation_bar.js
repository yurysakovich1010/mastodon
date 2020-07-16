import React from 'react';
import ImmutablePureComponent from 'react-immutable-pure-component';
import SearchContainer from 'mastodon/features/ui/components/search_container';
import horizontalLogo from 'mastodon/../images/brighteon-social/logo_horiz.png';
import { isMobile } from 'mastodon/is_mobile';

export default class UnsignedNavigationBar extends ImmutablePureComponent {
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
              <button className='donate standard mr3'>
                Donate
              </button>

              <a rel='noopener noreferrer' href='/auth/sign_in' className='decoration-none'>
                <button className='standard mr3'>
                  Log In
                </button>
              </a>

              <a rel='noopener noreferrer' href='/auth/sign_in' className='decoration-none'>
                <button className='primary-button standard'>
                  Sign Up
                </button>
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
        </div>
      </div>
    );
  }

}
