import React from 'react';
import { connect } from 'react-redux';
import { makeGetAccount } from 'mastodon/selectors';
import AccountCardActions from '../components/account_card_actions';
import {
  followAccount,
  unfollowAccount,
  unblockAccount,
  unmuteAccount,
  pinAccount,
  unpinAccount,
} from 'mastodon/actions/accounts';
import {
  mentionCompose,
  directCompose,
} from 'mastodon/actions/compose';
import { initMuteModal } from 'mastodon/actions/mutes';
import { initBlockModal } from 'mastodon/actions/blocks';
import { initReport } from 'mastodon/actions/reports';
import { openModal } from 'mastodon/actions/modal';
import { defineMessages, injectIntl, FormattedMessage } from 'react-intl';
import { unfollowModal } from 'mastodon/initial_state';
import { List as ImmutableList } from 'immutable';

const messages = defineMessages({
  unfollowConfirm: { id: 'confirmations.unfollow.confirm', defaultMessage: 'Unfollow' },
});

const mapDispatchToProps = (dispatch, { intl }) => ({

  onFollow (account) {
    if (account.getIn(['relationship', 'following']) || account.getIn(['relationship', 'requested'])) {
      if (unfollowModal) {
        dispatch(openModal('CONFIRM', {
          message: <FormattedMessage id='confirmations.unfollow.message' defaultMessage='Are you sure you want to unfollow {name}?' values={{ name: <strong>@{account.get('acct')}</strong> }} />,
          confirm: intl.formatMessage(messages.unfollowConfirm),
          onConfirm: () => dispatch(unfollowAccount(account.get('id'))),
        }));
      } else {
        dispatch(unfollowAccount(account.get('id')));
      }
    } else {
      dispatch(followAccount(account.get('id')));
    }
  },

  onBlock (account) {
    if (account.getIn(['relationship', 'blocking'])) {
      dispatch(unblockAccount(account.get('id')));
    } else {
      dispatch(initBlockModal(account));
    }
  },

  onMention (account, router) {
    dispatch(mentionCompose(account, router));
  },

  onDirect (account, router) {
    dispatch(directCompose(account, router));
  },

  onReblogToggle (account) {
    if (account.getIn(['relationship', 'showing_reblogs'])) {
      dispatch(followAccount(account.get('id'), false));
    } else {
      dispatch(followAccount(account.get('id'), true));
    }
  },

  onEndorseToggle (account) {
    if (account.getIn(['relationship', 'endorsed'])) {
      dispatch(unpinAccount(account.get('id')));
    } else {
      dispatch(pinAccount(account.get('id')));
    }
  },

  onReport (account) {
    dispatch(initReport(account));
  },

  onMute (account) {
    if (account.getIn(['relationship', 'muting'])) {
      dispatch(unmuteAccount(account.get('id')));
    } else {
      dispatch(initMuteModal(account));
    }
  },

  onAddToList(account){
    dispatch(openModal('LIST_ADDER', {
      accountId: account.get('id'),
    }));
  },

  openComposeModal() {
    dispatch(openModal('COMPOSE'));
  },
});

export default injectIntl(connect(null, mapDispatchToProps)(AccountCardActions));
