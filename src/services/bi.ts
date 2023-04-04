import TelemetryReporter from '@vscode/extension-telemetry';
import { telemetryInstrumentationKey } from '../consts';

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

let reporter: TelemetryReporter;

const log = (event: BIEvent) => {
  console.log(`BI: ${event.action}`);
  if (event.payload) {
    console.log(event.payload);
  }
};

export const initReporter = () => {
  reporter = new TelemetryReporter(telemetryInstrumentationKey);
  return reporter;
};

export const sendEvent = (event: BIEvent) => {
  log(event);
  if (reporter) {
    reporter.sendTelemetryEvent(event.action);
  }
};
