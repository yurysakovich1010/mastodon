import React from 'react';
import PropTypes from 'prop-types';
import { injectIntl } from 'react-intl';
import api from 'mastodon/api';
import ImmutablePropTypes from 'react-immutable-proptypes';

export default @injectIntl
class RepliesModal extends React.PureComponent {

  static propTypes = {
    onClose: PropTypes.func.isRequired,
    intl: PropTypes.object.isRequired,
    status: ImmutablePropTypes.map,
  };

  state = {
    replies: [],
  }

  componentDidMount() {
    this.getReplies();
  }

  getReplies = () => {
    const { status } = this.props;
    api().get(`/api/v1/statuses/${status.get('id')}/replies`)
      .then(({ data }) => {
        this.setState({
          replies: data.map(reply => reply.account),
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
    const { replies } = this.state;

    return (
      <div className='modal-root__modal replies-modal'>
        <div className='replies-modal__container'>
          <div className='replies-modal__header'>
            <div className='d-flex justify-content-space-between'>
              <span>Replies</span>
              <span>
                <i
                  className='fa fa-times replies-modal__close'
                  onClick={this.handleCancel}
                />
              </span>
            </div>
          </div>
          <div className='replies-modal__body'>
            {replies.map(reply => (
              <div
                className='d-flex replies-modal__reply-item'
                key={reply.id}
              >
                <div
                  className='replies-modal__reply-avatar mr2'
                  style={{
                    backgroundImage: `url(${reply.avatar})`,
                  }}
                />
                <strong>
                  { reply.username }
                </strong>
                <span> </span>
                <span>
                  @{ reply.acct }
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

}
