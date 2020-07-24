import React from 'react';
import { connect } from 'react-redux';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { FormattedMessage } from 'react-intl';
import Avatar from '../../../components/avatar';
import ImmutablePureComponent from 'react-immutable-pure-component';
import { makeGetAccount } from 'mastodon/selectors';

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
    fullAccount: ImmutablePropTypes.map.isRequired,
  };

  render () {
    console.log('this.props.account', this.props.account);
    console.log('this.props.fullAccount', this.props.fullAccount);
    return (
      <div className='profile_box'>
        <div className='profile_box-header'>
          <div className='profile_box-header__image' style={{backgroundImage: `url(${this.props.account.get('header_static')})`}} />
          <a href='/settings/profile' target='_blank' rel='noopener noreferrer'>
            <button className='button button-edit-profile'>
              <FormattedMessage id='account.edit_profile' defaultMessage='Edit profile' />
            </button>
          </a>
        </div>
        <div className='profile_box-avatar'>
          <a href={this.props.account.get('url')}>
            <Avatar account={this.props.account} size={48} />
          </a>
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
                { this.props.fullAccount.get('followers_count') }
              </div>
            </div>
            <div className='text-align-center'>
              <div>
                <FormattedMessage id='account.following' defaultMessage='Following' />
              </div>
              <div>
                { this.props.fullAccount.get('following_count') }
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
