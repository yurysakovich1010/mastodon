import { connect }   from 'react-redux';
import { injectIntl } from 'react-intl';
import ProfileBox from '../components/profile_box';
import { me } from '../../../initial_state';

const mapStateToProps = state => {
  return {
    account: state.getIn(['accounts', me]),
  };
};

export default injectIntl(connect(mapStateToProps)(ProfileBox));
