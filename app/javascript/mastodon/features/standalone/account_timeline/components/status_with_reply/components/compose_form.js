import React from 'react';
import classNames from 'classnames';
import CharacterCounter from 'mastodon/features/compose/components/character_counter';
import Button from 'mastodon/components/button';
import ImmutablePropTypes from 'react-immutable-proptypes';
import PropTypes from 'prop-types';
import ReplyIndicatorContainer from '../containers/reply_indicator_container';
import AutosuggestTextarea from 'mastodon/components/autosuggest_textarea';
// import AutosuggestInput from 'mastodon/components/autosuggest_input';
// import PollButtonContainer from 'mastodon/features/compose/containers/poll_button_container';
import UploadButtonContainer from '../containers/upload_button_container';
import { defineMessages, injectIntl } from 'react-intl';
// import SpoilerButtonContainer from 'mastodon/features/compose/containers/spoiler_button_container';
// import PrivacyDropdownContainer from 'mastodon/features/compose/containers/privacy_dropdown_container';
import EmojiPickerDropdown from '../containers/emoji_picker_dropdown_container';
// import PollFormContainer from 'mastodon/features/compose/containers/poll_form_container';
import UploadFormContainer from '../containers/upload_form_container';
// import WarningContainer from 'mastodon/features/compose/containers/warning_container';
import { isMobile } from 'mastodon/is_mobile';
import ImmutablePureComponent from 'react-immutable-pure-component';
import { length } from 'stringz';
import { countableText } from 'mastodon/features/compose/util/counter';
import Icon from 'mastodon/components/icon';

const allowedAroundShortCode = '><\u0085\u0020\u00a0\u1680\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u202f\u205f\u3000\u2028\u2029\u0009\u000a\u000b\u000c\u000d';

const messages = defineMessages({
  placeholder: { id: 'compose_form.placeholder', defaultMessage: 'What is on your mind?' },
  spoiler_placeholder: { id: 'compose_form.spoiler_placeholder', defaultMessage: 'Write your warning here' },
  publish: { id: 'compose_form.publish', defaultMessage: 'Post' },
  publishLoud: { id: 'compose_form.publish_loud', defaultMessage: '{publish}' },
});

export default @injectIntl
class ComposeForm extends ImmutablePureComponent {

  static contextTypes = {
    router: PropTypes.object,
  };

  static propTypes = {
    intl: PropTypes.object.isRequired,
    text: PropTypes.string.isRequired,
    suggestions: ImmutablePropTypes.list,
    spoiler: PropTypes.bool,
    privacy: PropTypes.string,
    spoilerText: PropTypes.string,
    focusDate: PropTypes.instanceOf(Date),
    caretPosition: PropTypes.number,
    preselectDate: PropTypes.instanceOf(Date),
    isSubmitting: PropTypes.bool,
    isChangingUpload: PropTypes.bool,
    isUploading: PropTypes.bool,
    onChange: PropTypes.func.isRequired,
    onSubmit: PropTypes.func.isRequired,
    onClearSuggestions: PropTypes.func.isRequired,
    onFetchSuggestions: PropTypes.func.isRequired,
    onSuggestionSelected: PropTypes.func.isRequired,
    onChangeSpoilerText: PropTypes.func.isRequired,
    onPaste: PropTypes.func.isRequired,
    onPickEmoji: PropTypes.func.isRequired,
    closeComposeModal: PropTypes.func.isRequired,
    showSearch: PropTypes.bool,
    anyMedia: PropTypes.bool,
    inReplyTo: PropTypes.any,
    singleColumn: PropTypes.bool,
    ancestor: ImmutablePropTypes.map.isRequired,
    replyCompose: PropTypes.func.isRequired,
    getReplies: PropTypes.func.isRequired,
  };

  static defaultProps = {
    showSearch: false,
  };

  state = {
    jumping: false,
  }

  handleChange = (e) => {
    // this.props.onChange(e.target.value);
    if (!this.props.inReplyTo) {
      this.props.replyCompose(this.props.ancestor);
    }
    if (this.props.inReplyTo === this.props.ancestor.get('id')) {
      this.props.onChange(e.target.value);
    }
  }

  handleKeyDown = (e) => {
    if (e.keyCode === 13 && (e.ctrlKey || e.metaKey)) {
      this.handleSubmit();
    }
  }

  handleSubmit = () => {
    if (this.props.text !== this.autosuggestTextarea.textarea.value) {
      // Something changed the text inside the textarea (e.g. browser extensions like Grammarly)
      // Update the state to match the current text
      this.props.onChange(this.autosuggestTextarea.textarea.value);
    }

    // Submit disabled:
    const { isSubmitting, isChangingUpload, isUploading, anyMedia } = this.props;
    const fulltext = [this.props.spoilerText, countableText(this.props.text)].join('');

    if (isSubmitting || isUploading || isChangingUpload || length(fulltext) > 500 || (fulltext.length !== 0 && fulltext.trim().length === 0 && !anyMedia)) {
      return;
    }

    this.props.closeComposeModal(); // for only account card dropdown actions and profile page dropdown actions
    this.jumpSubmitButton();
    this.props.onSubmit(this.context.router ? this.context.router.history : null);
  }

  jumpSubmitButton = () => {
    this.setState({
      jumping: true,
    });
    setTimeout(() => {
      this.setState({
        jumping: false,
      });
    }, 2000);
  }

  onSuggestionsClearRequested = () => {
    this.props.onClearSuggestions();
  }

  onSuggestionsFetchRequested = (token) => {
    this.props.onFetchSuggestions(token);
  }

  onSuggestionSelected = (tokenStart, token, value) => {
    this.props.onSuggestionSelected(tokenStart, token, value, ['text']);
  }

  onSpoilerSuggestionSelected = (tokenStart, token, value) => {
    this.props.onSuggestionSelected(tokenStart, token, value, ['spoiler_text']);
  }

  handleChangeSpoilerText = (e) => {
    this.props.onChangeSpoilerText(e.target.value);
  }

  handleFocus = () => {
    if (this.composeForm && !this.props.singleColumn) {
      const { left, right } = this.composeForm.getBoundingClientRect();
      if (left < 0 || right > (window.innerWidth || document.documentElement.clientWidth)) {
        this.composeForm.scrollIntoView();
      }
    }
    if (this.props.inReplyTo !== this.props.ancestor.get('id')) {
      this.props.replyCompose(this.props.ancestor);
    }
  }

  componentDidUpdate (prevProps) {
    // This statement does several things:
    // - If we're beginning a reply, and,
    //     - Replying to zero or one users, places the cursor at the end of the textbox.
    //     - Replying to more than one user, selects any usernames past the first;
    //       this provides a convenient shortcut to drop everyone else from the conversation.
    // if (this.props.focusDate !== prevProps.focusDate) {
    //   let selectionEnd, selectionStart;
    //
    //   if (this.props.preselectDate !== prevProps.preselectDate) {
    //     selectionEnd   = this.props.text.length;
    //     selectionStart = this.props.text.search(/\s/) + 1;
    //   } else if (typeof this.props.caretPosition === 'number') {
    //     selectionStart = this.props.caretPosition;
    //     selectionEnd   = this.props.caretPosition;
    //   } else {
    //     selectionEnd   = this.props.text.length;
    //     selectionStart = selectionEnd;
    //   }
    //
    //   this.autosuggestTextarea.textarea.setSelectionRange(selectionStart, selectionEnd);
    //   this.autosuggestTextarea.textarea.focus();
    // } else if(prevProps.isSubmitting && !this.props.isSubmitting) {
    //   this.autosuggestTextarea.textarea.focus();
    // } else if (this.props.spoiler !== prevProps.spoiler) {
    //   if (this.props.spoiler) {
    //     this.spoilerText.input.focus();
    //   } else {
    //     this.autosuggestTextarea.textarea.focus();
    //   }
    // }
    if (prevProps.isSubmitting && !this.props.isSubmitting) {
      this.props.getReplies();
    }
  }

  setAutosuggestTextarea = (c) => {
    this.autosuggestTextarea = c;
    if (this.props.passRefCb) {
      this.props.passRefCb(c);
    }
  }

  setSpoilerText = (c) => {
    this.spoilerText = c;
  }

  setRef = c => {
    this.composeForm = c;
  };

  handleEmojiPick = (data) => {
    const { text }     = this.props;
    const position     = this.autosuggestTextarea.textarea.selectionStart;
    const needsSpace   = data.custom && position > 0 && !allowedAroundShortCode.includes(text[position - 1]);

    this.props.onPickEmoji(position, data, needsSpace);
  }

  render () {
    const { intl, onPaste, showSearch, anyMedia } = this.props;
    const { jumping } = this.state;
    const disabled = this.props.isSubmitting;
    const text     = [this.props.spoilerText, countableText(this.props.text)].join('');
    const disabledButton = disabled || this.props.isUploading || this.props.isChangingUpload || length(text) > 500 || (text.length !== 0 && text.trim().length === 0 && !anyMedia);
    let publishText = '';

    if (this.props.privacy === 'private' || this.props.privacy === 'direct') {
      publishText = <span className='compose-form__publish-private'><Icon id='lock' /> {intl.formatMessage(messages.publish)}</span>;
    } else {
      publishText = this.props.privacy !== 'unlisted' ? intl.formatMessage(messages.publishLoud, { publish: intl.formatMessage(messages.publish) }) : intl.formatMessage(messages.publish);
    }

    return (
      <div className='compose-form'>
        {/*<WarningContainer />*/}

        {/*<ReplyIndicatorContainer />*/}

        {/*<div className={`spoiler-input ${this.props.spoiler ? 'spoiler-input--visible' : ''}`} ref={this.setRef}>*/}
        {/*  <AutosuggestInput*/}
        {/*    placeholder={intl.formatMessage(messages.spoiler_placeholder)}*/}
        {/*    value={this.props.spoilerText}*/}
        {/*    onChange={this.handleChangeSpoilerText}*/}
        {/*    onKeyDown={this.handleKeyDown}*/}
        {/*    disabled={!this.props.spoiler}*/}
        {/*    ref={this.setSpoilerText}*/}
        {/*    suggestions={this.props.suggestions}*/}
        {/*    onSuggestionsFetchRequested={this.onSuggestionsFetchRequested}*/}
        {/*    onSuggestionsClearRequested={this.onSuggestionsClearRequested}*/}
        {/*    onSuggestionSelected={this.onSpoilerSuggestionSelected}*/}
        {/*    searchTokens={[':']}*/}
        {/*    id='cw-spoiler-input'*/}
        {/*    className='spoiler-input__input'*/}
        {/*  />*/}
        {/*</div>*/}

        <AutosuggestTextarea
          ref={this.setAutosuggestTextarea}
          placeholder='Write a reply'
          disabled={disabled}
          // value={this.props.text}
          value={(this.props.inReplyTo === this.props.ancestor.get('id')) ? this.props.text : ''}
          onChange={this.handleChange}
          suggestions={this.props.suggestions}
          onFocus={this.handleFocus}
          onKeyDown={this.handleKeyDown}
          onSuggestionsFetchRequested={this.onSuggestionsFetchRequested}
          onSuggestionsClearRequested={this.onSuggestionsClearRequested}
          onSuggestionSelected={this.onSuggestionSelected}
          onPaste={onPaste}
          // autoFocus={!showSearch && !isMobile(window.innerWidth)}
          autoFocus={false}
        >
          <EmojiPickerDropdown
            onPickEmoji={this.handleEmojiPick}
            onFocus={this.handleFocus}
          />
          <div className='compose-form__modifiers'>
            {
              this.props.inReplyTo === this.props.ancestor.get('id') && (
                <UploadFormContainer />
              )
            }
            {/*<PollFormContainer />*/}
          </div>
        </AutosuggestTextarea>

        <div className='compose-form__buttons-wrapper'>
          <div className='compose-form__buttons'>
            <UploadButtonContainer
              onFocus={this.handleFocus}
            />
            {/*<PollButtonContainer />*/}
            {/*<PrivacyDropdownContainer />*/}
            {/*<SpoilerButtonContainer />*/}
          </div>
          <div className='character-counter__wrapper'><CharacterCounter max={500} text={text} /></div>
        </div>

        <div className='compose-form__publish'>
          <div className='compose-form__publish-button-wrapper'><Button className={classNames({ jumping })} text={publishText} onClick={this.handleSubmit} disabled={disabledButton} block /></div>
        </div>
      </div>
    );
  }

}
