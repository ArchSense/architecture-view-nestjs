import { AnalysisResult } from '@archsense/scout';
import * as vscode from 'vscode';
import { webviewTabTitle } from './consts';
import { getNonce } from './utils';

export default class ArchitectureViewPanel {
  public static currentPanel: ArchitectureViewPanel | undefined;

  private static readonly viewType = 'archsense';

  private readonly _panel: vscode.WebviewPanel;
  private readonly _extensionUri: vscode.Uri;
  private _disposables: vscode.Disposable[] = [];

  public static createOrShow(extContext: vscode.ExtensionContext) {
    const column = vscode.window.activeTextEditor
      ? vscode.window.activeTextEditor.viewColumn
      : undefined;
    if (ArchitectureViewPanel.currentPanel) {
      ArchitectureViewPanel.currentPanel._panel.reveal(column);
    } else {
      ArchitectureViewPanel.currentPanel = new ArchitectureViewPanel(
        extContext.extensionUri,
        column || vscode.ViewColumn.One,
      );
    }
    return ArchitectureViewPanel.currentPanel;
  }

  private constructor(extensionPath: vscode.Uri, column: vscode.ViewColumn) {
    this._extensionUri = extensionPath;
    this._panel = vscode.window.createWebviewPanel(
      ArchitectureViewPanel.viewType,
      webviewTabTitle,
      column,
      {
        enableScripts: true,
        localResourceRoots: [this._extensionUri],
      },
    );

    this._panel.webview.html = this._getHtmlForWebview(this._panel.webview);
    this._panel.onDidDispose(() => this.dispose(), null, this._disposables);

    // Handle messages from the webview
    this._panel.webview.onDidReceiveMessage(
      (message) => {
        switch (message.type) {
          case 'startup':
            console.log('The webview is up');
            return;
        }
      },
      null,
      this._disposables,
    );
  }

  public sendAnalysisResult(data: AnalysisResult) {
    this._panel.webview.postMessage({ type: 'analysis', payload: data });
  }

  public dispose() {
    ArchitectureViewPanel.currentPanel = undefined;
    this._panel.dispose();

    while (this._disposables.length) {
      const x = this._disposables.pop();
      if (x) {
        x.dispose();
      }
    }
  }

  private _getHtmlForWebview(webview: vscode.Webview) {
    const scriptUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, 'out', 'main.wv.js'),
    );

    const nonce = getNonce();

    return `<!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${webviewTabTitle}</title>
      </head>
      <body>
        <div id="root"></div>
        <script>
          window.vscode = acquireVsCodeApi();
          window.onload = function() {
            vscode.postMessage({ type: 'startup' });
          };
        </script>
        <script nonce="${nonce}" src="${scriptUri}"></script>
      </body>
      </html>
    `;
  }
}
