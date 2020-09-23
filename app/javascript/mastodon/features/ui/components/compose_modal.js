import React from 'react';
import ComposeFormContainer from '../../compose/containers/compose_form_container';

export default class ComposePanel extends React.PureComponent {
  render() {
    return (
      <div className='modal-root__modal compose-modal'>
        <ComposeFormContainer />
      </div>
    );
  }

}
