import React from 'react';
import { connect } from 'react-redux';
import { defineMessages, injectIntl, FormattedMessage } from 'react-intl';
import PropTypes from 'prop-types';
import StatusListContainer from '../ui/containers/status_list_container';
import Column from '../../components/column';
import ColumnHeader from '../../components/column_header';
import { expandTrendTimeline } from '../../actions/timelines';
import { addColumn, removeColumn, moveColumn } from '../../actions/columns';
import ColumnSettingsContainer from './containers/column_settings_container';
import { connectCommunityStream } from '../../actions/streaming';

const messages = defineMessages({
  title: { id: 'column.trends', defaultMessage: 'Trends' },
});

const mapStateToProps = (state, { columnId }) => {
  const uuid = columnId;
  const columns = state.getIn(['settings', 'columns']);
  const index = columns.findIndex(c => c.get('uuid') === uuid);
  const onlyMedia = (columnId && index >= 0) ? columns.get(index).getIn(['params', 'other', 'onlyMedia']) : state.getIn(['settings', 'public', 'other', 'onlyMedia']);
  const onlyRemote = (columnId && index >= 0) ? columns.get(index).getIn(['params', 'other', 'onlyRemote']) : state.getIn(['settings', 'public', 'other', 'onlyRemote']);
  const timelineState = state.getIn(['timelines', `community${onlyMedia ? ':media' : ''}`]);

  return {
    hasUnread: !!timelineState && timelineState.get('unread') > 0,
    onlyMedia,
    onlyRemote,
  };
};

export default @connect(mapStateToProps)
@injectIntl
class TrendTimeline extends React.PureComponent {

  static contextTypes = {
    router: PropTypes.object,
  };

  static defaultProps = {
    onlyMedia: false,
  };

  static propTypes = {
    dispatch: PropTypes.func.isRequired,
    shouldUpdateScroll: PropTypes.func,
    intl: PropTypes.object.isRequired,
    columnId: PropTypes.string,
    multiColumn: PropTypes.bool,
    hasUnread: PropTypes.bool,
    onlyMedia: PropTypes.bool,
    onlyRemote: PropTypes.bool,
  };

  handlePin = () => {
    const { columnId, dispatch, onlyMedia, onlyRemote } = this.props;

    if (columnId) {
      dispatch(removeColumn(columnId));
    } else {
      dispatch(addColumn(onlyRemote ? 'REMOTE' : 'PUBLIC', { other: { onlyMedia, onlyRemote } }));
    }
  }

  handleMove = (dir) => {
    const { columnId, dispatch } = this.props;
    dispatch(moveColumn(columnId, dir));
  }

  handleHeaderClick = () => {
    this.column.scrollTop();
  }

  componentDidMount () {
    const { dispatch, onlyMedia, onlyRemote } = this.props;

    dispatch(expandTrendTimeline({ onlyMedia, onlyRemote }));
    this.disconnect = dispatch(connectCommunityStream({ onlyMedia, onlyRemote }));
  }

  componentDidUpdate (prevProps) {
    if (prevProps.onlyMedia !== this.props.onlyMedia || prevProps.onlyRemote !== this.props.onlyRemote) {
      const { dispatch, onlyMedia, onlyRemote } = this.props;

      this.disconnect();
      dispatch(expandTrendTimeline({ onlyMedia, onlyRemote }));
      this.disconnect = dispatch(connectCommunityStream({ onlyMedia, onlyRemote }));
    }
  }

  componentWillUnmount () {
    if (this.disconnect) {
      this.disconnect();
      this.disconnect = null;
    }
  }

  setRef = c => {
    this.column = c;
  }

  handleLoadMore = maxId => {
    const { dispatch, onlyMedia, onlyRemote } = this.props;

    dispatch(expandTrendTimeline({ maxId, onlyMedia, onlyRemote }));
  }

  render () {
    const { intl, shouldUpdateScroll, columnId, hasUnread, multiColumn, onlyMedia, onlyRemote } = this.props;
    const pinned = !!columnId;

    return (
      <Column bindToDocument={!multiColumn} ref={this.setRef} label={intl.formatMessage(messages.title)}>
        <ColumnHeader
          icon='globe'
          active={hasUnread}
          title={intl.formatMessage(messages.title)}
          onPin={this.handlePin}
          onMove={this.handleMove}
          onClick={this.handleHeaderClick}
          pinned={pinned}
          multiColumn={multiColumn}
        >
          <ColumnSettingsContainer columnId={columnId} />
        </ColumnHeader>

        <StatusListContainer
          timelineId={`trend${onlyRemote ? ':remote' : ''}${onlyMedia ? ':media' : ''}`}
          onLoadMore={this.handleLoadMore}
          trackScroll={!pinned}
          scrollKey={`community_timeline-${columnId}`}
          emptyMessage={<FormattedMessage id='empty_column.community' defaultMessage='There is nothing here! Write something publicly, or manually follow users from other servers to fill it up' />}
          shouldUpdateScroll={shouldUpdateScroll}
          bindToDocument={!multiColumn}
        />
      </Column>
    );
  }

}
