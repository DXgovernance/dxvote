import { Question } from 'old-components/common';
import { FiZoomIn, FiZoomOut } from 'react-icons/fi';

export const ShowMore = ({ showMore, setShowMore }) => (
  <h2>
    Calls
    {showMore ? (
      <FiZoomOut
        onClick={() => {
          setShowMore(false);
        }}
      />
    ) : (
      <FiZoomIn
        onClick={() => {
          setShowMore(true);
        }}
      />
    )}
    <Question question="9" />
  </h2>
);
