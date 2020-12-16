import React from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { injectIntl } from 'react-intl';
import api from 'mastodon/api';
import ImmutablePropTypes from 'react-immutable-proptypes';

export default @injectIntl
class FavouritesModal extends React.PureComponent {

  static propTypes = {
    onClose: PropTypes.func.isRequired,
    intl: PropTypes.object.isRequired,
    status: ImmutablePropTypes.map,
  };

  state = {
    favourites: [],
  }

  componentDidMount() {
    this.getFavourites();
  }

  getFavourites = () => {
    const { status } = this.props;
    api().get(`/api/v1/statuses/${status.get('id')}/favourites`)
      .then(({ data }) => {
        const uniqueFavourites = data.reduce((unique, favourite) => {
          if (unique.findIndex(r => r.id === favourite.id) === -1) {
            unique.push(favourite);
          }
          return unique;
        }, []);
        this.setState({
          favourites: uniqueFavourites,
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
    const { favourites } = this.state;

    return (
      <div className='modal-root__modal favourites-modal'>
        <div className='favourites-modal__container'>
          <div className='favourites-modal__header'>
            <div className='d-flex justify-content-space-between'>
              <span>Favourites</span>
              <span>
                <i
                  className='fa fa-times favourites-modal__close'
                  onClick={this.handleCancel}
                />
              </span>
            </div>
          </div>
          <div className='favourites-modal__body'>
            {favourites.map(favourite => (
              <a
                href={favourite.url}
                key={favourite.id}
                className='favourites-modal__favourite-item'
              >
                <div
                  className='d-flex'
                >
                  <div
                    className='favourites-modal__favourite-avatar mr2'
                    style={{
                      backgroundImage: `url(${favourite.avatar})`,
                    }}
                  />
                  <strong>
                    { favourite.username }
                  </strong>
                  <span> </span>
                  <span>
                    @{ favourite.acct }
                  </span>
                </div>
              </a>
            ))}
          </div>
        </div>
      </div>
    );
  }

}
