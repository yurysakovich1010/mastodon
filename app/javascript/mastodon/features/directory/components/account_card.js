import React from 'react';
import ImmutablePureComponent from 'react-immutable-pure-component';
import ImmutablePropTypes from 'react-immutable-proptypes';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { makeGetAccount } from 'mastodon/selectors';
import Avatar from 'mastodon/components/avatar';
import DisplayName from 'mastodon/components/display_name';
import Permalink from 'mastodon/components/permalink';
import RelativeTimestamp from 'mastodon/components/relative_timestamp';
import IconButton from 'mastodon/components/icon_button';
import { FormattedMessage, injectIntl, defineMessages } from 'react-intl';
import { autoPlayGif, me, unfollowModal, isStaff } from 'mastodon/initial_state';
import ShortNumber from 'mastodon/components/short_number';
import {
  followAccount,
  unfollowAccount,
  blockAccount,
  unblockAccount,
  unmuteAccount,
} from 'mastodon/actions/accounts';
import { openModal } from 'mastodon/actions/modal';
import { initMuteModal } from 'mastodon/actions/mutes';
import DropdownMenuContainer from 'mastodon/containers/dropdown_menu_container';
import { initBlockModal } from '../../../actions/blocks';
import { directCompose, mentionCompose } from '../../../actions/compose';
import { pinAccount, unpinAccount } from '../../../actions/accounts';
import { initReport } from '../../../actions/reports';
import { blockDomain, unblockDomain } from '../../../actions/domain_blocks';
import AccountCardActionsContainer from '../containers/account_card_actions_container';

const messages = defineMessages({
  follow: { id: 'account.follow', defaultMessage: 'Follow' },
  unfollow: { id: 'account.unfollow', defaultMessage: 'Unfollow' },
  requested: { id: 'account.requested', defaultMessage: 'Awaiting approval' },
  unblock: { id: 'account.unblock', defaultMessage: 'Unblock @{name}' },
  unmute: { id: 'account.unmute', defaultMessage: 'Unmute @{name}' },
  unfollowConfirm: {
    id: 'confirmations.unfollow.confirm',
    defaultMessage: 'Unfollow',
  },
  cancel_follow_request: { id: 'account.cancel_follow_request', defaultMessage: 'Cancel follow request' },
  edit_profile: { id: 'account.edit_profile', defaultMessage: 'Edit profile' },
  linkVerifiedOn: { id: 'account.link_verified_on', defaultMessage: 'Ownership of this link was checked on {date}' },
  account_locked: { id: 'account.locked_info', defaultMessage: 'This account privacy status is set to locked. The owner manually reviews who can follow them.' },
  mention: { id: 'account.mention', defaultMessage: 'Mention @{name}' },
  direct: { id: 'account.direct', defaultMessage: 'Direct message @{name}' },
  block: { id: 'account.block', defaultMessage: 'Block @{name}' },
  mute: { id: 'account.mute', defaultMessage: 'Mute @{name}' },
  report: { id: 'account.report', defaultMessage: 'Report @{name}' },
  share: { id: 'account.share', defaultMessage: 'Share @{name}\'s profile' },
  media: { id: 'account.media', defaultMessage: 'Media' },
  blockDomain: { id: 'account.block_domain', defaultMessage: 'Block domain {domain}' },
  unblockDomain: { id: 'account.unblock_domain', defaultMessage: 'Unblock domain {domain}' },
  hideReblogs: { id: 'account.hide_reblogs', defaultMessage: 'Hide boosts from @{name}' },
  showReblogs: { id: 'account.show_reblogs', defaultMessage: 'Show boosts from @{name}' },
  pins: { id: 'navigation_bar.pins', defaultMessage: 'Pinned posts' },
  preferences: { id: 'navigation_bar.preferences', defaultMessage: 'Preferences' },
  follow_requests: { id: 'navigation_bar.follow_requests', defaultMessage: 'Follow requests' },
  favourites: { id: 'navigation_bar.favourites', defaultMessage: 'Favourites' },
  lists: { id: 'navigation_bar.lists', defaultMessage: 'Lists' },
  blocks: { id: 'navigation_bar.blocks', defaultMessage: 'Blocked users' },
  domain_blocks: { id: 'navigation_bar.domain_blocks', defaultMessage: 'Blocked domains' },
  mutes: { id: 'navigation_bar.mutes', defaultMessage: 'Muted users' },
  endorse: { id: 'account.endorse', defaultMessage: 'Feature on profile' },
  unendorse: { id: 'account.unendorse', defaultMessage: 'Don\'t feature on profile' },
  add_or_remove_from_list: { id: 'account.add_or_remove_from_list', defaultMessage: 'Add or Remove from lists' },
  admin_account: { id: 'status.admin_account', defaultMessage: 'Open moderation interface for @{name}' },
});

const makeMapStateToProps = () => {
  const getAccount = makeGetAccount();

  const mapStateToProps = (state, { id }) => ({
    account: getAccount(state, id),
  });

  return mapStateToProps;
};

const mapDispatchToProps = (dispatch, { intl }) => ({
  onFollow(account) {
    if (
      account.getIn(['relationship', 'following']) ||
      account.getIn(['relationship', 'requested'])
    ) {
      if (unfollowModal) {
        dispatch(
          openModal('CONFIRM', {
            message: (
              <FormattedMessage
                id='confirmations.unfollow.message'
                defaultMessage='Are you sure you want to unfollow {name}?'
                values={{ name: <strong>@{account.get('acct')}</strong> }}
              />
            ),
            confirm: intl.formatMessage(messages.unfollowConfirm),
            onConfirm: () => dispatch(unfollowAccount(account.get('id'))),
          }),
        );
      } else {
        dispatch(unfollowAccount(account.get('id')));
      }
    } else {
      dispatch(followAccount(account.get('id')));
    }
  },

  onBlock(account) {
    if (account.getIn(['relationship', 'blocking'])) {
      dispatch(unblockAccount(account.get('id')));
    } else {
      dispatch(blockAccount(account.get('id')));
    }
  },

  onMute(account) {
    if (account.getIn(['relationship', 'muting'])) {
      dispatch(unmuteAccount(account.get('id')));
    } else {
      dispatch(initMuteModal(account));
    }
  },
});

export default
@injectIntl
@connect(makeMapStateToProps, mapDispatchToProps)
class AccountCard extends ImmutablePureComponent {

  static propTypes = {
    account: ImmutablePropTypes.map.isRequired,
    intl: PropTypes.object.isRequired,
    onFollow: PropTypes.func.isRequired,
    onBlock: PropTypes.func.isRequired,
    onMute: PropTypes.func.isRequired,
  };

  _updateEmojis() {
    const node = this.node;

    if (!node || autoPlayGif) {
      return;
    }

    const emojis = node.querySelectorAll('.custom-emoji');

    for (var i = 0; i < emojis.length; i++) {
      let emoji = emojis[i];
      if (emoji.classList.contains('status-emoji')) {
        continue;
      }
      emoji.classList.add('status-emoji');

      emoji.addEventListener('mouseenter', this.handleEmojiMouseEnter, false);
      emoji.addEventListener('mouseleave', this.handleEmojiMouseLeave, false);
    }
  }

  componentDidMount() {
    this._updateEmojis();
  }

  componentDidUpdate() {
    this._updateEmojis();
  }

  handleEmojiMouseEnter = ({ target }) => {
    target.src = target.getAttribute('data-original');
  };

  handleEmojiMouseLeave = ({ target }) => {
    target.src = target.getAttribute('data-static');
  };

  handleFollow = () => {
    this.props.onFollow(this.props.account);
  };

  handleBlock = () => {
    this.props.onBlock(this.props.account);
  };

  handleMute = () => {
    this.props.onMute(this.props.account);
  };

  setRef = (c) => {
    this.node = c;
  };

  render() {
    const { account, intl } = this.props;

    let buttons;

    if (
      account.get('id') !== me &&
      account.get('relationship', null) !== null
    ) {
      const following = account.getIn(['relationship', 'following']);
      const requested = account.getIn(['relationship', 'requested']);
      const blocking = account.getIn(['relationship', 'blocking']);
      const muting = account.getIn(['relationship', 'muting']);

      if (requested) {
        buttons = (
          <IconButton
            disabled
            icon='hourglass'
            title={intl.formatMessage(messages.requested)}
          />
        );
      } else if (blocking) {
        buttons = (
          <IconButton
            active
            icon='unlock'
            title={intl.formatMessage(messages.unblock, {
              name: account.get('username'),
            })}
            onClick={this.handleBlock}
          />
        );
      } else if (muting) {
        buttons = (
          <IconButton
            active
            icon='volume-up'
            title={intl.formatMessage(messages.unmute, {
              name: account.get('username'),
            })}
            onClick={this.handleMute}
          />
        );
      } else if (!account.get('moved') || following) {
        buttons = (
          <IconButton
            icon={following ? 'user-times' : 'user-plus'}
            title={intl.formatMessage(
              following ? messages.unfollow : messages.follow,
            )}
            onClick={this.handleFollow}
            active={following}
          />
        );
      }
    }

    return (
      <div className='directory__card'>
        <div className='directory__card__img'>
          <img
            src={
              autoPlayGif ? account.get('header') : account.get('header_static')
            }
            alt=''
          />
        </div>

        <div className='directory__card__bar'>
          <a
            className='directory__card__bar__name'
            href={account.get('url')}
          >
            <Avatar account={account} size={48} />
            <DisplayName account={account} />
          </a>

          <div className='directory__card__bar__relationship account__relationship'>
            {buttons}
          </div>

          <AccountCardActionsContainer account={account} />
        </div>

        <div className='directory__card__extra' ref={this.setRef}>
          <div
            className='account__header__content'
            dangerouslySetInnerHTML={{ __html: account.get('note_emojified') }}
          />
        </div>

        <div className='directory__card__extra'>
          <div className='accounts-table__count'>
            <ShortNumber value={account.get('statuses_count')} />
            <small>
              <FormattedMessage id='account.posts' defaultMessage='Posts' />
            </small>
          </div>
          <div className='accounts-table__count'>
            <ShortNumber value={account.get('followers_count')} />{' '}
            <small>
              <FormattedMessage
                id='account.followers'
                defaultMessage='Followers'
              />
            </small>
          </div>
          <div className='accounts-table__count'>
            {account.get('last_status_at') === null ? (
              <FormattedMessage
                id='account.never_active'
                defaultMessage='Never'
              />
            ) : (
              <RelativeTimestamp timestamp={account.get('last_status_at')} />
            )}{' '}
            <small>
              <FormattedMessage
                id='account.last_status'
                defaultMessage='Last active'
              />
            </small>
          </div>
        </div>
      </div>
    );
  }

}
