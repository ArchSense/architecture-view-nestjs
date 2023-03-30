export type BIEvent = {
  action: BI_ACTIONS;
  payload?: unknown;
};

export enum BI_ACTIONS {
  start = 'showArchitectureCommand',
  parserStart = 'runScout',
  parserSuccess = 'runScoutSuccess',
  parserError = 'runScoutError',
  clientStart = 'clientStart',
  openFile = 'openFile',
}

// TODO User telemetry
// https://code.visualstudio.com/api/extension-guides/telemetry
export const send = (event: BIEvent) => {
  console.log(`BI: ${event.action}`);
  if (event.payload) {
    console.log(event.payload);
  }
};
