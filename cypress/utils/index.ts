export * from './constants';

export const clickAnywhereToClose = (nodeOrSelector: string = 'body') => {
  return cy.get(nodeOrSelector).click(0, 0).wait(1000);
};

