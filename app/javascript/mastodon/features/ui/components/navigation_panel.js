import React from 'react';
import { NavLink, withRouter } from 'react-router-dom';
import { FormattedMessage } from 'react-intl';
import Icon from 'mastodon/components/icon';
import { profile_directory } from 'mastodon/initial_state';
import NotificationsCounterIcon from './notifications_counter_icon';
import FollowRequestsNavLink from './follow_requests_nav_link';
import ListPanel from './list_panel';

const NavigationPanel = () => (
  <div className='navigation-panel-'>
    <div className='column-menu'>
      Menu
    </div>
    <NavLink className='column-link column-link--transparent' to='/timelines/home' data-preview-title-id='column.home' data-preview-icon='home' ><Icon className='column-link__icon' id='home' fixedWidth /><FormattedMessage id='tabs_bar.home' defaultMessage='Home' /></NavLink>
    <NavLink className='column-link column-link--transparent' to='/notifications' data-preview-title-id='column.notifications' data-preview-icon='bell' ><NotificationsCounterIcon className='column-link__icon' /><FormattedMessage id='tabs_bar.notifications' defaultMessage='Notifications' /></NavLink>
    <FollowRequestsNavLink />
    {/* <NavLink className='column-link column-link--transparent' to='/timelines/public/local' data-preview-title-id='column.community' data-preview-icon='users' ><Icon className='column-link__icon' id='users' fixedWidth /><FormattedMessage id='tabs_bar.local_timeline' defaultMessage='Local' /></NavLink> */}
    {/* <NavLink className='column-link column-link--transparent' exact to='/timelines/public' data-preview-title-id='column.public' data-preview-icon='globe' ><Icon className='column-link__icon' id='globe' fixedWidth /><FormattedMessage id='tabs_bar.federated_timeline' defaultMessage='Federated' /></NavLink> */}
    <NavLink className='column-link column-link--transparent' to='/timelines/direct'><Icon className='column-link__icon' id='envelope' fixedWidth /><FormattedMessage id='navigation_bar.direct' defaultMessage='Direct messages' /></NavLink>
    <a className='column-link column-link--transparent' href='/relationships'><Icon className='column-link__icon' id='users' fixedWidth /><FormattedMessage id='navigation_bar.follows_and_followers' defaultMessage='Follows and followers' /></a>
    <NavLink className='column-link column-link--transparent' to='/favourites'><Icon className='column-link__icon' id='star' fixedWidth /><FormattedMessage id='navigation_bar.favourites' defaultMessage='Favourites' /></NavLink>
    <NavLink className='column-link column-link--transparent' to='/bookmarks'><Icon className='column-link__icon' id='bookmark' fixedWidth /><FormattedMessage id='navigation_bar.bookmarks' defaultMessage='Bookmarks' /></NavLink>
    {profile_directory && <NavLink className='column-link column-link--transparent' to='/directory'><Icon className='column-link__icon' id='address-book-o' fixedWidth /><FormattedMessage id='getting_started.directory' defaultMessage='Connect' /></NavLink>}
    <NavLink className='column-link column-link--transparent' to='/lists'><Icon className='column-link__icon' id='list-ul' fixedWidth /><FormattedMessage id='navigation_bar.lists' defaultMessage='Lists' /></NavLink>

    <ListPanel />

    <hr />

    <div className='column-menu'>
      Explore
    </div>
    <NavLink className='column-link column-link--transparent' to='/timelines/trend' target='_self' rel='noopener noreferrer'><Icon className='column-link__icon' id='bar-chart' fixedWidth /><FormattedMessage id='navigation_bar.trends' defaultMessage='Trends' /></NavLink>
    <NavLink className='column-link column-link--transparent' to='/timelines/public' target='_self' rel='noopener noreferrer'><Icon className='column-link__icon' id='globe' fixedWidth /><FormattedMessage id='navigation_bar.live_stream' defaultMessage='Live Stream' /></NavLink>
    <a className='column-link column-link--transparent' href='http://www.brighteonstore.com' target='_blank' rel='noopener noreferrer'><Icon className='column-link__icon' id='tags' fixedWidth /><FormattedMessage id='navigation_bar.shop' defaultMessage='Shop' /></a>
    <a className='column-link column-link--transparent' href='https://www.brighteon.com' target='_blank' rel='noopener noreferrer'><Icon className='column-link__icon' id='rocket' fixedWidth /><FormattedMessage id='navigation_bar.brighteon_company' defaultMessage='Brighteon.com' /></a>
    <a className='column-link column-link--transparent' href='http://naturalNews.com' target='_blank' rel='noopener noreferrer'><Icon className='column-link__icon' id='rocket' fixedWidth /><FormattedMessage id='navigation_bar.natural_news_company' defaultMessage='NaturalNews.com' /></a>
    <a className='column-link column-link--transparent' href='https://newstarget.com' target='_blank' rel='noopener noreferrer'><Icon className='column-link__icon' id='rocket' fixedWidth /><FormattedMessage id='navigation_bar.newstarget' defaultMessage='Newstarget.com' /></a>

    <div className='mb3' />
    <a className='column-link column-link--transparent' href='/settings/preferences'><Icon className='column-link__icon' id='cog' fixedWidth /><FormattedMessage id='navigation_bar.preferences' defaultMessage='Preferences' /></a>
  </div>
);

export default withRouter(NavigationPanel);
