import React from 'react';
import GlobalNotification from '../GlobalNotification';

const handledErrorTypes = {
  CacheLoadError:
    'We ran into an error while trying to update the cache. Data shown below might be incorrect or outdated. Please reload the page and try again.',
};

class GlobalErrorBoundary extends React.Component<
  {},
  { hasError: boolean; errorMessage: string }
> {
  constructor(props) {
    super(props);
    this.state = { hasError: false, errorMessage: null };
  }

  static getDerivedStateFromError(error: Error) {
    const errorMessage = this ? this.getErrorMessage(error.name) : false;
    return {
      hasError: !!errorMessage,
      errorMessage,
    };
  }

  componentDidMount() {
    window.addEventListener('unhandledrejection', this.promiseRejectionHandler);
  }

  componentWillUnmount() {
    window.removeEventListener(
      'unhandledrejection',
      this.promiseRejectionHandler
    );
  }

  private promiseRejectionHandler = (event: PromiseRejectionEvent) => {
    const errorMessage = GlobalErrorBoundary.getErrorMessage(
      event?.reason?.name
    );
    if (errorMessage) {
      this.setState({
        hasError: true,
        errorMessage: errorMessage,
      });
    }
  };

  private static getErrorMessage(errorName) {
    if (Object.keys(handledErrorTypes).includes(errorName)) {
      return handledErrorTypes[errorName];
    }

    return null;
  }

  render() {
    return (
      <>
        <GlobalNotification
          visible={this.state.hasError}
          type="ERROR"
          message={this.state.errorMessage}
        />
        {this.props.children}
      </>
    );
  }
}

export default GlobalErrorBoundary;
