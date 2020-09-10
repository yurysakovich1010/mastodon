import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import LinkFooter from './link_footer';
import { changeComposing } from 'mastodon/actions/compose';
import ProfileBoxContainer from 'mastodon/features/compose/containers/profile_box_container';
import TrendsContainer from 'mastodon/features/getting_started/containers/trends_container';
import { showTrends } from 'mastodon/initial_state';

export default @connect()
class ComposePanel extends React.PureComponent {

  static propTypes = {
    dispatch: PropTypes.func.isRequired,
  };

  onFocus = () => {
    this.props.dispatch(changeComposing(true));
  }

  render() {
    return (
      <div className='compose-panel' onFocus={this.onFocus}>
        <ProfileBoxContainer />
        <div className='spacer' />
        {
          showTrends && (
            <TrendsContainer />
          )
        }
        <LinkFooter withHotkeys />
      </div>
    );
  }

}
