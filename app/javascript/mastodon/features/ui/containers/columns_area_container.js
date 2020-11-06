import { connect } from 'react-redux';
import ColumnsArea from '../components/columns_area';
import { makeGetStatus } from '../../../selectors';

const mapStateToProps = state => {
  const getStatus = makeGetStatus();

  return {
    columns: state.getIn(['settings', 'columns']),
    isModalOpen: !!state.get('modal').modalType,
    statusToReply: getStatus(state, { id: state.getIn(['compose', 'in_reply_to']) }),
  };
};

export default connect(mapStateToProps, null, null, { forwardRef: true })(ColumnsArea);
