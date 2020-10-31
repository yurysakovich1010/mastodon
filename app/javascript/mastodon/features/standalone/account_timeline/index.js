import React, { Fragment } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { expandAccountTimeline } from 'mastodon/actions/timelines';
import { List as ImmutableList, Map as ImmutableMap } from 'immutable';
import StatusContainer from './containers/status_container';
import LoadMore from '../../../components/load_more';

const generateTimelineId = function(accountId, pinned, unpinned) {
  if (window.location.pathname.slice(0, 2) === '/@') {
    let onlyReplies = false, onlyImage = false, onlyVideo = false, specific = false, withReplies = false;
    if (window.location.pathname.includes('/with_replies')) {
      onlyReplies = true;
    } else if (window.location.pathname.includes('/photos')) {
      onlyImage = true;
    } else if (window.location.pathname.includes('/videos')) {
      onlyVideo = true;
    } else if (window.location.pathname.split('/').length === 3) {
      specific = true;
    } else {
      withReplies = true;
    }
    return `account:${accountId}${onlyReplies ? ':only_replies' : ''}${onlyImage ? ':only_image' : ''}${onlyVideo ? ':only_video' : ''}${specific ? ':specific' : ''}${withReplies ? ':with_replies' : ''}${pinned ? ':pinned' : ''}${unpinned ? ':unpinned' : ''}`;
  }
  return '';
};

const getParams = function(pinned, unpinned) {
  const params = {};
  if (window.location.pathname.slice(0, 2) === '/@') {
    if (window.location.pathname.includes('/with_replies')) {
      params.onlyReplies = true;
    } else if (window.location.pathname.includes('/photos')) {
      params.onlyImage = true;
    } else if (window.location.pathname.includes('/videos')) {
      params.onlyVideo = true;
    } else if (window.location.pathname.split('/').length === 3) {
      params.statusId = window.location.pathname.split('/')[2];
    } else {
      params.withReplies = true;
    }
  }
  return {
    ...params,
    pinned,
    unpinned,
  };
};

const mapStateToProps = (state, { accountId, pinned, unpinned }) => {
  const timelineId = generateTimelineId(accountId, pinned, unpinned);
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
    accountId: PropTypes.any,
    pinned: PropTypes.any,
    unpinned: PropTypes.any,
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
    const { dispatch, accountId, pinned, unpinned } = this.props;

    let params = getParams(pinned, unpinned);

    dispatch(expandAccountTimeline(accountId, params));
  }

  handleLoadMore = () => {
    const { dispatch, accountId, statusIds, pinned, unpinned } = this.props;
    const maxId = statusIds.last();
    let params = getParams(pinned, unpinned);

    if (maxId) {
      dispatch(expandAccountTimeline(accountId, { maxId, ...params }));
    }
  };

  render () {
    const { statusIds, username, avatar, statusId: statusIdProp, isLoading, hasMore, pinned, unpinned } = this.props;
    const loadMore = hasMore ? <LoadMore visible={!isLoading} onClick={this.handleLoadMore} /> : null;

    return (
      <Fragment>
        {
          statusIds.map(statusId => (
            <StatusContainer
              key={`f-${statusId}`}
              id={statusId}
              onMoveUp={null}
              onMoveDown={null}
              contextType={'public'}
              username={username}
              avatar={avatar}
              statusId={statusIdProp}
              showThread
            />
          ),
          )
        }
        { loadMore }
      </Fragment>
    );
  }

}
