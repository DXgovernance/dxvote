import { Link } from 'react-router-dom';

export const Error = ({ error }) => {
  if (error.message === 'API') {
    return (
      <div>
        An API Key error has occured:
        <Link to="/config"> Click here to enter API key</Link>
      </div>
    );
  } else return <p>{error.message}</p>;
};
