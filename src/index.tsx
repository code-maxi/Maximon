import React from 'react';
import ReactDOM from 'react-dom';
import './css/index.css';
import App from './gui/editor/App';
import { EventList } from './gui/editor/gameEditor/events';

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);

export function TestEvents() {
  const [evts, setEvts] = React.useState([
    {
      command: '/jumper/set-speechbuble',
      custom: { text: 'Test, test!' }
    }
  ])
  return <EventList
    evts={evts}
    onEvtChange={e => setEvts(e)}
  />
}

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
// reportWebVitals();
