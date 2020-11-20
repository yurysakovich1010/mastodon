import { connect } from 'react-redux';
import UploadForm from '../components/upload_form';

const mapStateToProps = state => ({
  mediaIds: state.getIn(['compose_in_reply', 'media_attachments']).map(item => item.get('id')),
});

export default connect(mapStateToProps)(UploadForm);
