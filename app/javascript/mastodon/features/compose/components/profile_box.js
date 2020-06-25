import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { defineMessages, FormattedMessage } from 'react-intl';
import Avatar from '../../../components/avatar';
import Permalink from '../../../components/permalink';
import ImmutablePureComponent from 'react-immutable-pure-component';
import { makeGetAccount } from 'mastodon/selectors';
import { shortNumberFormat } from 'mastodon/utils/numbers';

const messages = defineMessages({
  edit_profile: { id: 'account.edit_profile', defaultMessage: 'Edit profile' },
  followers: { id: 'account.followers', defaultMessage: 'Followers' },
  followers: { id: 'account.following', defaultMessage: 'Following' },
});


const makeMapStateToProps = () => {
  const getAccount = makeGetAccount();

  const mapStateToProps = (state, props) => ({
    fullAccount: getAccount(state, props.account.get('id')),
  });

  return mapStateToProps;
};

export default @connect(makeMapStateToProps)
class ProfileBox extends ImmutablePureComponent {

  static propTypes = {
    account: ImmutablePropTypes.map.isRequired,
  };

  render () {
    return (
      <div className='profile_box'>
        <div className='profile_box-header'>
          <img src={this.props.account.get('header_static')} />
          <a href='/settings/profile' target='_blank' rel='noopener noreferrer'>
            <button className='button button-edit-profile'>
              <FormattedMessage id='account.edit_profile' defaultMessage='Edit profile' />
            </button>
          </a>
        </div>
        <div className='profile_box-avatar'>
          <Permalink href={this.props.account.get('url')} to={`/accounts/${this.props.account.get('id')}`}>
            <Avatar account={this.props.account} size={48} />
          </Permalink>
        </div>
        <div className='profile_box-body'>
          <div className='d-flex justify-content-center'>{this.props.account.get('display_name_html')}</div>
          <div className='d-flex justify-content-center'>@brighteon.social</div>
          <div className='d-flex justify-content-space-around mt2'>
            <div className='text-align-center'>
              <div>
                <FormattedMessage id='account.followers' defaultMessage='Followers' />
              </div>
              <div>
                { shortNumberFormat(this.props.fullAccount.get('followers_count')) }
              </div>
            </div>
            <div className='text-align-center'>
              <div>
                <FormattedMessage id='account.following' defaultMessage='Following' />
              </div>
              <div>
                { shortNumberFormat(this.props.fullAccount.get('following_count')) }
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
