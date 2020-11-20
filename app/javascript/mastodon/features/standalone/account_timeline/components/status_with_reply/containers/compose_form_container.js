import { connect } from 'react-redux';
import ComposeForm from '../components/compose_form';
import {
  changeCompose,
  submitCompose,
  clearComposeSuggestions,
  fetchComposeSuggestions,
  selectComposeSuggestion,
  changeComposeSpoilerText,
  insertEmojiCompose,
  uploadCompose,
  replyCompose,
// } from 'mastodon/actions/compose';
} from 'mastodon/actions/compose_in_reply';
import { closeModal } from 'mastodon/actions/modal';

const mapStateToProps = state => ({
  text: state.getIn(['compose_in_reply', 'text']),
  suggestions: state.getIn(['compose_in_reply', 'suggestions']),
  spoiler: state.getIn(['compose_in_reply', 'spoiler']),
  spoilerText: state.getIn(['compose_in_reply', 'spoiler_text']),
  privacy: state.getIn(['compose_in_reply', 'privacy']),
  focusDate: state.getIn(['compose_in_reply', 'focusDate']),
  caretPosition: state.getIn(['compose_in_reply', 'caretPosition']),
  preselectDate: state.getIn(['compose_in_reply', 'preselectDate']),
  isSubmitting: state.getIn(['compose_in_reply', 'is_submitting']),
  isChangingUpload: state.getIn(['compose_in_reply', 'is_changing_upload']),
  isUploading: state.getIn(['compose_in_reply', 'is_uploading']),
  showSearch: state.getIn(['search', 'submitted']) && !state.getIn(['search', 'hidden']),
  anyMedia: state.getIn(['compose_in_reply', 'media_attachments']).size > 0,
  inReplyTo: state.getIn(['compose_in_reply', 'in_reply_to']),
});

const mapDispatchToProps = (dispatch) => ({

  onChange (text) {
    dispatch(changeCompose(text));
  },

  onSubmit (router) {
    dispatch(submitCompose(router));
  },

  onClearSuggestions () {
    dispatch(clearComposeSuggestions());
  },

  onFetchSuggestions (token) {
    dispatch(fetchComposeSuggestions(token));
  },

  onSuggestionSelected (position, token, suggestion, path) {
    dispatch(selectComposeSuggestion(position, token, suggestion, path));
  },

  onChangeSpoilerText (checked) {
    dispatch(changeComposeSpoilerText(checked));
  },

  onPaste (files) {
    dispatch(uploadCompose(files));
  },

  onPickEmoji (position, data, needsSpace) {
    dispatch(insertEmojiCompose(position, data, needsSpace));
  },

  closeComposeModal() {
    dispatch(closeModal('COMPOSE'));
  },

  replyCompose(status) {
    dispatch(replyCompose(status));
  },

});

export default connect(mapStateToProps, mapDispatchToProps)(ComposeForm);
