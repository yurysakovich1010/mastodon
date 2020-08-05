import React, { Fragment } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { expandPublicTimeline, expandCommunityTimeline } from 'mastodon/actions/timelines';
import Masonry from 'react-masonry-infinite';
import { List as ImmutableList, Map as ImmutableMap } from 'immutable';
import DetailedStatusContainer from 'mastodon/features/status/containers/detailed_status_container';
import { debounce } from 'lodash';
import LoadingIndicator from 'mastodon/components/loading_indicator';
import {FormattedMessage} from "react-intl";
import StatusList from "../../../components/status_list";
import StatusContainer from "./containers/status_container";

const mapStateToProps = (state, { local }) => {
  const timeline = state.getIn(['timelines', local ? 'community' : 'public'], ImmutableMap());

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
    const { dispatch, local } = this.props;

    dispatch(local ? expandCommunityTimeline() : expandPublicTimeline());
  }

  handleLoadMore = () => {
    const { dispatch, statusIds, local } = this.props;
    const maxId = statusIds.last();

    if (maxId) {
      dispatch(local ? expandCommunityTimeline({ maxId }) : expandPublicTimeline({ maxId }));
    }
  }

  render () {
    const { statusIds, username, avatar, statusId: statusIdProp } = this.props;

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
            />
          ))
        }
      </Fragment>
    );
  }

}
