import React from 'react';
import { Sparklines, SparklinesCurve } from 'react-sparklines';
import { FormattedMessage } from 'react-intl';
import ImmutablePropTypes from 'react-immutable-proptypes';
import Permalink from './permalink';
import { shortNumberFormat } from '../utils/numbers';

const ExternalTrend = ({ trends }) => {
  const url = trends.get('url');

  // Adding the script tag to the head as suggested before
  let head = document.head;

//  let meta = document.createElement('meta');
//  meta.httpEquiv = "Content-Security-Policy";
//  meta.content = "script-src-elem http://*.brighteon.social;";
//  head.appendChild(meta);

  let script = document.createElement('script');
  script.type = 'text/javascript';
  script.src = url;

  // Then bind the event to the callback function.
  // There are several events for cross browser compatibility.
  script.onreadystatechange = function(args) { console.log('onreadystate changed', args); };
  script.onload = function(args) { console.log('onload', args); };

  // Fire the loading
  head.appendChild(script);

  return (
    <div className='trends__item'>
      <div className='trends__item__name'>
        Trending right now
      </div>
    </div>
  );
};

ExternalTrend.propTypes = {
  trends: ImmutablePropTypes.map.isRequired,
};

export default ExternalTrend;
