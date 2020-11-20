import { connect } from 'react-redux';
import Upload from 'mastodon/features/compose/components/upload';
import { undoUploadCompose } from 'mastodon/actions/compose_in_reply';
import { openModal } from 'mastodon/actions/modal';
import { submitCompose } from 'mastodon/actions/compose_in_reply';

const mapStateToProps = (state, { id }) => ({
  media: state.getIn(['compose_in_reply', 'media_attachments']).find(item => item.get('id') === id),
});

const mapDispatchToProps = dispatch => ({

  onUndo: id => {
    dispatch(undoUploadCompose(id));
  },

  onOpenFocalPoint: id => {
    dispatch(openModal('FOCAL_POINT', { id }));
  },

  onSubmit (router) {
    dispatch(submitCompose(router));
  },

});

export default connect(mapStateToProps, mapDispatchToProps)(Upload);
