import * as vscode from 'vscode';
import ArchitectureViewPanel from './panel';
import { BI_ACTIONS, send } from './services/bi';
import { analyze } from './services/parser';

export function activate(context: vscode.ExtensionContext) {
  const disposable = vscode.commands.registerCommand('archsense.showArchitecture', async () => {
    send({ action: BI_ACTIONS.start });

    const roots = await vscode.workspace.findFiles('**/src/main.ts', '**/node_modules/**');

    if (!roots || roots.length === 0) {
      console.log('Archsense: the workspace is empty');
      return;
    }

    const rootFoldersMap = roots.reduce((acc, curr) => {
      const parts = curr.path.split('/');
      const rootFolderName = parts.at(-3) as string;
      const rootFolderPath = parts.slice(0, -2).join('/');
      acc[rootFolderName] = rootFolderPath;
      return acc;
    }, {});

    let rootFolderPath = Object.values(rootFoldersMap)[0] as string;

    if (Object.values(rootFoldersMap).length > 1) {
      // show the picker only in mono-repo several projects
      const rootAppName = await vscode.window.showQuickPick(Object.keys(rootFoldersMap), {
        canPickMany: false,
        placeHolder: 'Looks like you have several projects here, which one would you like to see?',
      });

      if (!rootAppName) {
        return;
      }
      rootFolderPath = rootFoldersMap[rootAppName];
    }

    try {
      send({ action: BI_ACTIONS.parserStart });
      const analysis = await analyze(rootFolderPath);
      send({ action: BI_ACTIONS.parserSuccess, payload: analysis });
      const currentView = ArchitectureViewPanel.createOrShow(context);
      currentView.onInit(() => {
        currentView.sendAnalysisResult(analysis);
      });
      currentView.onActivate(() => {
        currentView.sendAnalysisResult(analysis);
      });
    } catch (error) {
      send({ action: BI_ACTIONS.parserError, payload: error });
      vscode.window.showErrorMessage('Archsense: could not build analysis');
    }
  });

  context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
// eslint-disable-next-line @typescript-eslint/no-empty-function
export function deactivate() { }
