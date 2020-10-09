import React, { Fragment } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { expandAccountTimeline } from 'mastodon/actions/timelines';
import { List as ImmutableList, Map as ImmutableMap } from 'immutable';
import StatusContainer from "./containers/status_container";
import LoadMore from "../../../components/load_more";

const generateTimelineId = function(accountId) {
  if (window.location.pathname.slice(0, 2) === '/@' && window.location.pathname.includes('/with_replies')) {
    return `account:${accountId}:only_replies`;
  }
  if (window.location.pathname.slice(0, 2) === '/@' && window.location.pathname.includes('/photos')) {
    return `account:${accountId}:only_image`;
  }
  if (window.location.pathname.slice(0, 2) === '/@' && window.location.pathname.includes('/videos')) {
    return `account:${accountId}:only_video`;
  }
  return `account:${accountId}:with_replies`;
};

const getParams = function() {
  if (window.location.pathname.slice(0, 2) === '/@' && window.location.pathname.includes('/with_replies')) {
    return { onlyReplies: true }
  }
  if (window.location.pathname.slice(0, 2) === '/@' && window.location.pathname.includes('/photos')) {
    return { onlyImage: true }
  }
  if (window.location.pathname.slice(0, 2) === '/@' && window.location.pathname.includes('/videos')) {
    return { onlyVideo: true }
  }
  return { withReplies: true }
};

const mapStateToProps = (state, { accountId }) => {
  const timelineId = generateTimelineId(accountId);
  const timeline = state.getIn(['timelines', timelineId], ImmutableMap());

  return {
    statusIds: timeline.get('items', ImmutableList()),
    isLoading: timeline.get('isLoading', false),
    hasMore: timeline.get('hasMore', false),
  };
};

export default @connect(mapStateToProps)
class AccountTimeline extends React.PureComponent {

  static propTypes = {
    dispatch: PropTypes.func.isRequired,
    statusIds: ImmutablePropTypes.list.isRequired,
    isLoading: PropTypes.bool.isRequired,
    hasMore: PropTypes.bool.isRequired,
    local: PropTypes.bool,
    username: PropTypes.string.isRequired,
    avatar: PropTypes.string,
    statusId: PropTypes.any,
  };

  componentDidMount () {
    this._connect();
  }

  componentDidUpdate (prevProps) {
    if (prevProps.local !== this.props.local) {
      this._connect();
    }
  }

  _connect () {
    const { dispatch, accountId } = this.props;

    let params = getParams();

    dispatch(expandAccountTimeline(accountId, params));
  }

  handleLoadMore = () => {
    const { dispatch, accountId, statusIds } = this.props;
    const maxId = statusIds.last();
    let params = getParams();

    if (maxId) {
      dispatch(expandAccountTimeline(accountId, { maxId, ...params }));
    }
  };

  render () {
    const { statusIds, username, avatar, statusId: statusIdProp, isLoading, hasMore } = this.props;
    const loadMore = hasMore ? <LoadMore visible={!isLoading} onClick={this.handleLoadMore} /> : null;

    return (
      <Fragment>
        {
          statusIds.map(statusId => (
            <StatusContainer
              key={`f-${statusId}`}
              id={statusId}
              onMoveUp={() => {}}
              onMoveDown={() => {}}
              contextType={'public'}
              username={username}
              avatar={avatar}
              statusId={statusIdProp}
              showThread
            />
            )
          ).filter(com => {
            console.log('com', com);
            return !!com;
          })
        }
        { loadMore }
      </Fragment>
    );
  }

}
