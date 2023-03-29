export type BIEvent = {
  action: ACTIONS;
  payload?: any;
};

export enum ACTIONS {
  start = 'showArchitectureCommand',
  parserStart = 'runScout',
  parserSuccess = 'runScoutSuccess',
  parserError = 'runScoutError',
}

// TODO User telemetry
// https://code.visualstudio.com/api/extension-guides/telemetry
export const send = (event: BIEvent) => {
  console.log(event.action);
  if (event.payload) {
    console.log(event.payload);
  }
};
