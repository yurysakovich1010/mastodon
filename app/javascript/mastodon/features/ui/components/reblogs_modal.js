import React from 'react';
import PropTypes from 'prop-types';
import { injectIntl } from 'react-intl';
import api from 'mastodon/api';
import ImmutablePropTypes from 'react-immutable-proptypes';

export default @injectIntl
class ReblogsModal extends React.PureComponent {

  static propTypes = {
    onClose: PropTypes.func.isRequired,
    intl: PropTypes.object.isRequired,
    status: ImmutablePropTypes.map,
  };

  state = {
    reblogs: [],
  }

  componentDidMount() {
    this.getReblogs();
  }

  getReblogs = () => {
    const { status } = this.props;
    api().get(`/api/v1/statuses/${status.get('id')}/reblogs`)
      .then(({ data }) => {
        this.setState({
          reblogs: data.map(reblog => reblog.account),
        });
      })
      .catch(err => {
        console.log(err);
      });
  }

  handleCancel = () => {
    this.props.onClose();
  }

  render () {
    const { reblogs } = this.state;

    return (
      <div className='modal-root__modal reblogs-modal'>
        <div className='reblogs-modal__container'>
          <div className='reblogs-modal__header'>
            <div className='d-flex justify-content-space-between'>
              <span>Boosts</span>
              <span>
                <i
                  className='fa fa-times reblogs-modal__close'
                  onClick={this.handleCancel}
                />
              </span>
            </div>
          </div>
          <div className='reblogs-modal__body'>
            {reblogs.map(reblog => (
              <div
                className='d-flex reblogs-modal__reblog-item'
                key={reblog.id}
              >
                <div
                  className='reblogs-modal__reblog-avatar mr2'
                  style={{
                    backgroundImage: `url(${reblog.avatar})`,
                  }}
                />
                <strong>
                  { reblog.username }
                </strong>
                <span> </span>
                <span>
                  @{ reblog.acct }
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

}
