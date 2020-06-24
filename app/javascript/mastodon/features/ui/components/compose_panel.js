import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import LinkFooter from './link_footer';
import { changeComposing } from 'mastodon/actions/compose';

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
        <div className='spacer' />
        <LinkFooter withHotkeys />
      </div>
    );
  }

}
