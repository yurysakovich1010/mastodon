import { connect } from 'react-redux';
import { cancelReplyCompose } from 'mastodon/actions/compose_in_reply';
import { makeGetStatus } from 'mastodon/selectors';
import ReplyIndicator from 'mastodon/features/compose/components/reply_indicator';

const makeMapStateToProps = () => {
  const getStatus = makeGetStatus();

  const mapStateToProps = state => ({
    status: getStatus(state, { id: state.getIn(['compose_in_reply', 'in_reply_to']) }),
  });

  return mapStateToProps;
};

const mapDispatchToProps = dispatch => ({

  onCancel () {
    dispatch(cancelReplyCompose());
  },

});

export default connect(makeMapStateToProps, mapDispatchToProps)(ReplyIndicator);
