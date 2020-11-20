import { connect } from 'react-redux';
import UploadButton from 'mastodon/features/compose/components/upload_button';
import { uploadCompose } from 'mastodon/actions/compose_in_reply';

const mapStateToProps = state => ({
  disabled: state.getIn(['compose_in_reply', 'is_uploading']) || (state.getIn(['compose_in_reply', 'media_attachments']).size + state.getIn(['compose_in_reply', 'pending_media_attachments']) > 3 || state.getIn(['compose_in_reply', 'media_attachments']).some(m => ['video', 'audio'].includes(m.get('type')))),
  unavailable: state.getIn(['compose_in_reply', 'poll']) !== null,
  resetFileKey: state.getIn(['compose_in_reply', 'resetFileKey']),
});

const mapDispatchToProps = dispatch => ({

  onSelectFile (files) {
    dispatch(uploadCompose(files));
  },

});

export default connect(mapStateToProps, mapDispatchToProps)(UploadButton);
