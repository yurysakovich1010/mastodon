import { connect } from 'react-redux';
import UploadProgress from 'mastodon/features/compose/components/upload_progress';

const mapStateToProps = state => ({
  active: state.getIn(['compose_in_reply', 'is_uploading']),
  progress: state.getIn(['compose_in_reply', 'progress']),
});

export default connect(mapStateToProps)(UploadProgress);
