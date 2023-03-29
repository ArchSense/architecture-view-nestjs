import * as vscode from 'vscode';
import ArchitectureViewPanel from './panel';
import { ACTIONS, send } from './services/bi';
import { analyze } from './services/parser';

export function activate(context: vscode.ExtensionContext) {
  const disposable = vscode.commands.registerCommand('archsense.showArchitecture', async () => {
    send({ action: ACTIONS.start });

    const folders = vscode.workspace.workspaceFolders;
    if (!folders?.length) {
      return;
    }

    const rootFolder = folders[0];

    try {
      send({ action: ACTIONS.parserStart });
      const analysis = await analyze(rootFolder.uri.path);
      send({ action: ACTIONS.parserSuccess, payload: analysis });
      const currentView = ArchitectureViewPanel.createOrShow(context);
      currentView.onInit(() => {
        currentView.sendAnalysisResult(analysis);
      });
    } catch (error) {
      send({ action: ACTIONS.parserError, payload: error });
      vscode.window.showErrorMessage('Archsense: could not build analysis');
    }
  });

  context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
// eslint-disable-next-line @typescript-eslint/no-empty-function
export function deactivate() {}
