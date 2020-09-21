import React from 'react';
import ImmutablePropTypes from 'react-immutable-proptypes';
import PropTypes from 'prop-types';
import Avatar from '../../../../components/avatar';
import RelativeTimestamp from '../../../../components/relative_timestamp';
import DisplayName from '../../../../components/display_name';
import StatusContent from '../../../../components/status_content';
import StatusActionBar from './status_action_bar';
import AttachmentList from '../../../../components/attachment_list';
import Card from '../../../../features/status/components/card';
import { injectIntl, defineMessages, FormattedMessage } from 'react-intl';
import ImmutablePureComponent from 'react-immutable-pure-component';
import { MediaGallery, Video, Audio } from '../../../../features/ui/util/async-components';
import classNames from 'classnames';
import Icon from 'mastodon/components/icon';
import { displayMedia } from '../../../../initial_state';
import api from 'mastodon/api';

// We use the component (and not the container) since we do not want
// to use the progress bar to show download progress
import Bundle from '../../../../features/ui/components/bundle';

export const textForScreenReader = (intl, status, rebloggedByText = false) => {
  const displayName = status.getIn(['account', 'display_name']);

  const values = [
    displayName.length === 0 ? status.getIn(['account', 'acct']).split('@')[0] : displayName,
    status.get('spoiler_text') && status.get('hidden') ? status.get('spoiler_text') : status.get('search_index').slice(status.get('spoiler_text').length),
    intl.formatDate(status.get('created_at'), { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' }),
    status.getIn(['account', 'acct']),
  ];

  if (rebloggedByText) {
    values.push(rebloggedByText);
  }

  return values.join(', ');
};

export const defaultMediaVisibility = (status) => {
  if (!status) {
    return undefined;
  }

  if (status.get('reblog', null) !== null && typeof status.get('reblog') === 'object') {
    status = status.get('reblog');
  }

  return (displayMedia !== 'hide_all' && !status.get('sensitive') || displayMedia === 'show_all');
};

const messages = defineMessages({
  public_short: { id: 'privacy.public.short', defaultMessage: 'Public' },
  unlisted_short: { id: 'privacy.unlisted.short', defaultMessage: 'Unlisted' },
  private_short: { id: 'privacy.private.short', defaultMessage: 'Followers-only' },
  direct_short: { id: 'privacy.direct.short', defaultMessage: 'Direct' },
});

export default @injectIntl
class Status extends ImmutablePureComponent {

  static contextTypes = {
    router: PropTypes.object,
  };

  static propTypes = {
    status: ImmutablePropTypes.map,
    account: ImmutablePropTypes.map,
    otherAccounts: ImmutablePropTypes.list,
    onClick: PropTypes.func,
    onReply: PropTypes.func,
    onFavourite: PropTypes.func,
    onReblog: PropTypes.func,
    onDelete: PropTypes.func,
    onDirect: PropTypes.func,
    onMention: PropTypes.func,
    onPin: PropTypes.func,
    onOpenMedia: PropTypes.func,
    onOpenVideo: PropTypes.func,
    onBlock: PropTypes.func,
    onEmbed: PropTypes.func,
    onHeightChange: PropTypes.func,
    onToggleHidden: PropTypes.func,
    onToggleCollapsed: PropTypes.func,
    muted: PropTypes.bool,
    hidden: PropTypes.bool,
    unread: PropTypes.bool,
    onMoveUp: PropTypes.func,
    onMoveDown: PropTypes.func,
    showThread: PropTypes.bool,
    getScrollPosition: PropTypes.func,
    updateScrollBottom: PropTypes.func,
    cacheMediaWidth: PropTypes.func,
    cachedMediaWidth: PropTypes.number,
    scrollKey: PropTypes.string,
    username: PropTypes.string,
    avatar: PropTypes.string,
    statusId: PropTypes.any,
  };

  // Avoid checking props that are functions (and whose equality will always
  // evaluate to false. See react-immutable-pure-component for usage.
  updateOnProps = [
    'status',
    'account',
    'muted',
    'hidden',
  ];

  state = {
    showMedia: defaultMediaVisibility(this.props.status),
    statusId: undefined,
    replyText: '',
    descendants: [],
    repliesCount: 0,
    repliesCountUpdated: false,
    showAllReplies: false
  };

  static getDerivedStateFromProps(nextProps, prevState) {
    if (nextProps.status && nextProps.status.get('id') !== prevState.statusId) {
      return {
        showMedia: defaultMediaVisibility(nextProps.status),
        statusId: nextProps.status.get('id'),
      };
    } else {
      return null;
    }
  }

  handleToggleMediaVisibility = () => {
    this.setState({ showMedia: !this.state.showMedia });
  }

  handleClick = () => {
    if (this.props.onClick) {
      this.props.onClick();
      return;
    }

    if (!this.context.router) {
      return;
    }

    const { status } = this.props;
    this.context.router.history.push(`/statuses/${status.getIn(['reblog', 'id'], status.get('id'))}`);
  }

  handleExpandClick = (e) => {
    if (this.props.onClick) {
      this.props.onClick();
      return;
    }

    if (e.button === 0) {
      if (!this.context.router) {
        return;
      }

      const { status } = this.props;
      this.context.router.history.push(`/statuses/${status.getIn(['reblog', 'id'], status.get('id'))}`);
    }
  }

  handleAccountClick = (e) => {
    // if (this.context.router && e.button === 0 && !(e.ctrlKey || e.metaKey)) {
    //   const id = e.currentTarget.getAttribute('data-id');
    //   e.preventDefault();
    //   this.context.router.history.push(`/accounts/${id}`);
    // }
  }

  handleExpandedToggle = () => {
    this.props.onToggleHidden(this._properStatus());
  }

  handleCollapsedToggle = isCollapsed => {
    this.props.onToggleCollapsed(this._properStatus(), isCollapsed);
  }

  renderLoadingMediaGallery () {
    return <div className='media-gallery' style={{ height: '110px' }} />;
  }

  renderLoadingVideoPlayer () {
    return <div className='video-player' style={{ height: '110px' }} />;
  }

  renderLoadingAudioPlayer () {
    return <div className='audio-player' style={{ height: '110px' }} />;
  }

  handleOpenVideo = (media, options) => {
    this.props.onOpenVideo(media, options);
  }

  handleHotkeyOpenMedia = e => {
    const { onOpenMedia, onOpenVideo } = this.props;
    const status = this._properStatus();

    e.preventDefault();

    if (status.get('media_attachments').size > 0) {
      if (status.getIn(['media_attachments', 0, 'type']) === 'audio') {
        // TODO: toggle play/paused?
      } else if (status.getIn(['media_attachments', 0, 'type']) === 'video') {
        onOpenVideo(status.getIn(['media_attachments', 0]), { startTime: 0 });
      } else {
        onOpenMedia(status.get('media_attachments'), 0);
      }
    }
  }

  handleHotkeyReply = e => {
    e.preventDefault();
    this.props.onReply(this._properStatus(), this.context.router.history);
  }

  handleHotkeyFavourite = () => {
    this.props.onFavourite(this._properStatus());
  }

  handleHotkeyBoost = e => {
    this.props.onReblog(this._properStatus(), e);
  }

  handleHotkeyMention = e => {
    e.preventDefault();
    this.props.onMention(this._properStatus().get('account'), this.context.router.history);
  }

  handleHotkeyOpen = () => {
    this.context.router.history.push(`/statuses/${this._properStatus().get('id')}`);
  }

  handleHotkeyOpenProfile = () => {
    this.context.router.history.push(`/accounts/${this._properStatus().getIn(['account', 'id'])}`);
  }

  handleHotkeyMoveUp = e => {
    this.props.onMoveUp(this.props.status.get('id'), e.target.getAttribute('data-featured'));
  }

  handleHotkeyMoveDown = e => {
    this.props.onMoveDown(this.props.status.get('id'), e.target.getAttribute('data-featured'));
  }

  handleHotkeyToggleHidden = () => {
    this.props.onToggleHidden(this._properStatus());
  }

  handleHotkeyToggleSensitive = () => {
    this.handleToggleMediaVisibility();
  }

  _properStatus () {
    const { status } = this.props;

    if (status.get('reblog', null) !== null && typeof status.get('reblog') === 'object') {
      return status.get('reblog');
    } else {
      return status;
    }
  }

  handleRef = c => {
    this.node = c;
  }

  handleReply = () => {
    // this.setState({ showReplyBox: true });
  }

  updateReply = (e) => {
    this.setState({
      replyText: e.target.value
    })
  }

  reply = () => {
    // merge compose component here

    api().post('/api/v1/statuses', {
      in_reply_to_id: this.props.status.get('id'),
      media_ids: [],
      poll: null,
      sensitive: false,
      spoiler_text: "",
      status: this.state.replyText,
      visibility: "public"
    })
      .then(({data}) => {
        if (data && data.id) {
          this.setState({
            replyText: '',
            repliesCount: this.state.repliesCount + 1,
            repliesCountUpdated: true
          });
        }
      });
  }

  toggleShowAllReplies = () => {
    this.setState({
      showAllReplies: !this.state.showAllReplies
    })
  }

  OnInput() {
    this.style.height = 'auto';
    this.style.height = (this.scrollHeight) + 'px';
  }

  componentDidMount() {
    this.replyBox.style = 'height:' + (this.replyBox.scrollHeight) + 'px;overflow-y:hidden;';
    this.replyBox.addEventListener("input", this.OnInput);
  }

  componentWillUnmount() {
    this.replyBox.removeEventListener("input", this.OnInput);
  }

  setReplyBox = (c) => {
    this.replyBox = c;
  }

  render () {
    let media = null;
    let statusAvatar, prepend, rebloggedByText;

    const { intl, hidden, featured, otherAccounts, unread, showThread, scrollKey } = this.props;

    let { status, account, username, avatar, statusId, ...other } = this.props;

    if (status === null) {
      return null;
    }

    const handlers = this.props.muted ? {} : {
      reply: this.handleHotkeyReply,
      favourite: this.handleHotkeyFavourite,
      boost: this.handleHotkeyBoost,
      mention: this.handleHotkeyMention,
      open: this.handleHotkeyOpen,
      openProfile: this.handleHotkeyOpenProfile,
      moveUp: this.handleHotkeyMoveUp,
      moveDown: this.handleHotkeyMoveDown,
      toggleHidden: this.handleHotkeyToggleHidden,
      toggleSensitive: this.handleHotkeyToggleSensitive,
      openMedia: this.handleHotkeyOpenMedia,
    };

    if (hidden) {
      return (
        <div ref={this.handleRef} className={classNames('status__wrapper', { focusable: !this.props.muted })} tabIndex='0'>
          {status.getIn(['account', 'display_name']) || status.getIn(['account', 'username'])}
          {status.get('content')}
        </div>
      );
    }

    if (status.get('filtered') || status.getIn(['reblog', 'filtered'])) {
      const minHandlers = this.props.muted ? {} : {
        moveUp: this.handleHotkeyMoveUp,
        moveDown: this.handleHotkeyMoveDown,
      };

      return (
        <div className='status__wrapper status__wrapper--filtered focusable' tabIndex='0' ref={this.handleRef}>
          <FormattedMessage id='status.filtered' defaultMessage='Filtered' />
        </div>
      );
    }

    if (status.get('in_reply_to_account_name')) {
      prepend = (
        <div className='status__prepend'>
          Replied to {status.get('in_reply_to_account_name')}'s post
        </div>
      );
    } else if (featured) {
      prepend = (
        <div className='status__prepend'>
          <div className='status__prepend-icon-wrapper'><Icon id='thumb-tack' className='status__prepend-icon' fixedWidth /></div>
          <FormattedMessage id='status.pinned' defaultMessage='Pinned toot' />
        </div>
      );
    } else if (status.get('reblog', null) !== null && typeof status.get('reblog') === 'object') {
      const display_name_html = { __html: status.getIn(['account', 'display_name_html']) };

      prepend = (
        <div className='status__prepend'>
          <div className='status__prepend-icon-wrapper'><Icon id='retweet' className='status__prepend-icon' fixedWidth /></div>
          <FormattedMessage id='status.reblogged_by' defaultMessage='{name} boosted' values={{ name: <a onClick={this.handleAccountClick} data-id={status.getIn(['account', 'id'])} href={status.getIn(['account', 'url'])} className='status__display-name muted'><bdi><strong dangerouslySetInnerHTML={display_name_html} /></bdi></a> }} />
        </div>
      );

      rebloggedByText = intl.formatMessage({ id: 'status.reblogged_by', defaultMessage: '{name} boosted' }, { name: status.getIn(['account', 'acct']) });

      account = status.get('account');
      status  = status.get('reblog');
    }

    if (status.get('media_attachments').size > 0) {
      if (this.props.muted) {
        media = (
          <AttachmentList
            compact
            media={status.get('media_attachments')}
          />
        );
      } else if (status.getIn(['media_attachments', 0, 'type']) === 'audio') {
        const attachment = status.getIn(['media_attachments', 0]);

        media = (
          <Bundle fetchComponent={Audio} loading={this.renderLoadingAudioPlayer} >
            {Component => (
              <Component
                src={attachment.get('url')}
                alt={attachment.get('description')}
                poster={attachment.get('preview_url') || status.getIn(['account', 'avatar_static'])}
                backgroundColor={attachment.getIn(['meta', 'colors', 'background'])}
                foregroundColor={attachment.getIn(['meta', 'colors', 'foreground'])}
                accentColor={attachment.getIn(['meta', 'colors', 'accent'])}
                duration={attachment.getIn(['meta', 'original', 'duration'], 0)}
                width={this.props.cachedMediaWidth}
                height={110}
                cacheWidth={this.props.cacheMediaWidth}
              />
            )}
          </Bundle>
        );
      } else if (status.getIn(['media_attachments', 0, 'type']) === 'video') {
        const attachment = status.getIn(['media_attachments', 0]);

        media = (
          <Bundle fetchComponent={Video} loading={this.renderLoadingVideoPlayer} >
            {Component => (
              <Component
                preview={attachment.get('preview_url')}
                blurhash={attachment.get('blurhash')}
                src={attachment.get('url')}
                alt={attachment.get('description')}
                width={this.props.cachedMediaWidth}
                height={110}
                inline
                sensitive={status.get('sensitive')}
                onOpenVideo={this.handleOpenVideo}
                cacheWidth={this.props.cacheMediaWidth}
                visible={this.state.showMedia}
                onToggleVisibility={this.handleToggleMediaVisibility}
              />
            )}
          </Bundle>
        );
      } else {
        media = (
          <Bundle fetchComponent={MediaGallery} loading={this.renderLoadingMediaGallery}>
            {Component => (
              <Component
                media={status.get('media_attachments')}
                sensitive={status.get('sensitive')}
                height={110}
                onOpenMedia={this.props.onOpenMedia}
                cacheWidth={this.props.cacheMediaWidth}
                defaultWidth={this.props.cachedMediaWidth}
                visible={this.state.showMedia}
                onToggleVisibility={this.handleToggleMediaVisibility}
              />
            )}
          </Bundle>
        );
      }
    } else if (status.get('spoiler_text').length === 0 && status.get('card')) {
      media = (
        <Card
          onOpenMedia={this.props.onOpenMedia}
          card={status.get('card')}
          compact
          cacheWidth={this.props.cacheMediaWidth}
          defaultWidth={this.props.cachedMediaWidth}
          sensitive={status.get('sensitive')}
        />
      );
    }

    // if (otherAccounts && otherAccounts.size > 0) {
    //   statusAvatar = <AvatarComposite accounts={otherAccounts} size={48} />;
    // } else if (account === undefined || account === null) {
      statusAvatar = <Avatar account={status.get('account')} size={48} />;
    // } else {
    //   statusAvatar = <AvatarOverlay account={status.get('account')} friend={account} />;
    // }

    const visibilityIconInfo = {
      'public': { icon: 'globe', text: intl.formatMessage(messages.public_short) },
      'unlisted': { icon: 'unlock', text: intl.formatMessage(messages.unlisted_short) },
      'private': { icon: 'lock', text: intl.formatMessage(messages.private_short) },
      'direct': { icon: 'envelope', text: intl.formatMessage(messages.direct_short) },
    };

    const visibilityIcon = visibilityIconInfo[status.get('visibility')];

    const acct = status.getIn(['account', 'acct']);
    const avatarStyle = {
      width: '36px',
      height: '36px',
      backgroundSize: '36px 36px',
      backgroundImage: `url(${avatar})`
    };
    if (acct === username) { // filter status by user
      if (!statusId || (statusId === status.get('id'))) { // filter status by id in status page, not profile page
        if (this.state.repliesCount === 0 && status.get('replies_count') > 0) {
          this.setState({
            repliesCount: status.get('replies_count')
          });
        }

        const { repliesCountUpdated } = this.state;
        if (repliesCountUpdated || (this.state.descendants.length === 0 && status.get('replies_count') > 0)) {
          api().get(`/api/v1/statuses/${status.get('id')}/context`)
            .then(({data}) => {
              if (this.state.descendants.length < data.descendants.length) {
                this.setState({
                  descendants: data.descendants,
                  repliesCountUpdated: false,
                });
              }
            });
        }

        return (
          <div className={classNames('status__wrapper', `status__wrapper-${status.get('visibility')}`, { 'status__wrapper-reply': !!status.get('in_reply_to_id'), read: unread === false, focusable: !this.props.muted })} tabIndex={this.props.muted ? null : 0} data-featured={featured ? 'true' : null} aria-label={textForScreenReader(intl, status, rebloggedByText)} ref={this.handleRef}>
            {prepend}

            <div className={classNames('status', `status-${status.get('visibility')}`, { 'status-reply': !!status.get('in_reply_to_id'), muted: this.props.muted, read: unread === false })} data-id={status.get('id')}>
              <div className='status__expand' onClick={this.handleExpandClick} role='presentation' />
              <div className='status__info'>
                <div>
                  <a onClick={this.handleAccountClick} data-id={status.getIn(['account', 'id'])} href={status.getIn(['account', 'url'])} title={status.getIn(['account', 'acct'])} className='status__display-name' target='_blank' rel='noopener noreferrer'>
                    <div className='status__avatar'>
                      {statusAvatar}
                    </div>

                    <DisplayName account={status.get('account')} others={otherAccounts} />
                  </a>
                </div>
                <div>
                  <a href={status.get('url')} className='status__relative-time' target='_blank' rel='noopener noreferrer'><RelativeTimestamp timestamp={status.get('created_at')} /></a>
                  {/*<span className='status__visibility-icon'><Icon id={visibilityIcon.icon} title={visibilityIcon.text} /></span>*/}
                </div>
              </div>

              <StatusContent status={status} onClick={this.handleClick} expanded={!status.get('hidden')} showThread={showThread} onExpandedToggle={this.handleExpandedToggle} collapsable onCollapsedToggle={this.handleCollapsedToggle} />

              {media}

              <StatusActionBar scrollKey={scrollKey} status={status} account={account} {...other} onReply={this.handleReply} repliesCount={this.state.repliesCount} showAllReplies={this.state.showAllReplies} toggleShowAllReplies={this.toggleShowAllReplies} />

              {
                this.state.descendants.filter(
                  (d, idx) => (idx < 3 || this.state.showAllReplies)
                ).map((descendant) => (
                  <div className='status__reply' key={descendant.id}>
                    <div className="status__avatar">
                      <a
                        className="account__avatar"
                        style={{
                          width: '36px',
                          height: '36px',
                          backgroundSize: '36px 36px',
                          backgroundImage: `url(${descendant.account.avatar || descendant.account.avatar_static})`
                        }}
                        href={descendant.account.url}
                        target="_blank"
                      />
                    </div>

                    <div className="status__reply-box">
                      <div className='display-name'>
                        <a href={descendant.account.url} target='_blank' rel='noopener noreferrer'>
                          <strong className='display-name__html' dangerouslySetInnerHTML={{ __html: descendant.account.display_name || descendant.account.username }} />
                        </a>
                        &nbsp;
                        <span className='display-name__account'>@{descendant.account.acct}</span>
                      </div>
                      <a href={descendant.url} className='status__relative-time' target='_blank' rel='noopener noreferrer'><RelativeTimestamp timestamp={descendant.created_at} /></a>
                      <div className="status__content" dangerouslySetInnerHTML={{__html: descendant.content}} />
                    </div>
                  </div>
                ))
              }

              {
                !this.state.showAllReplies && this.state.descendants.length > 3 && (
                  <button className="status__content__read-more-button" onClick={this.toggleShowAllReplies}>
                    <span>Show All Replies</span>
                  </button>
                )
              }

              {
                this.state.showAllReplies && this.state.descendants.length > 3 && (
                  <button className="status__content__read-more-button" onClick={this.toggleShowAllReplies}>
                    <span>Show Top 3 Replies</span>
                  </button>
                )
              }

              <div className='status__reply'>
                <div className="status__avatar">
                  <div className="account__avatar" style={avatarStyle} />
                </div>

                <div className="status__reply-box">
                  <textarea className="textarea" placeholder='Write a reply' rows='1' onChange={this.updateReply} value={this.state.replyText} ref={this.setReplyBox} />
                  {/*<ComposeFormContainer />*/}

                  <button className='button btn-post' onClick={this.reply}>Post</button>
                </div>
              </div>
            </div>
          </div>
        );
      }
    }

    return null;
  }

}
