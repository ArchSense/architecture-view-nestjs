import { AnalysisResult } from '@archsense/scout';
import * as vscode from 'vscode';
import { webviewTabTitle } from './consts';
import { getNonce } from './utils';

type InitCallback = () => void;

export default class ArchitectureViewPanel {
  public static currentPanel: ArchitectureViewPanel | undefined;

  private static readonly viewType = 'archsense';

  private isAppLoaded = false;
  private initCallbacks: InitCallback[] = [];
  private readonly webviewPanel: vscode.WebviewPanel;
  private readonly extensionUri: vscode.Uri;
  private _disposables: vscode.Disposable[] = [];

  public static createOrShow(extContext: vscode.ExtensionContext) {
    const column = vscode.window.activeTextEditor
      ? vscode.window.activeTextEditor.viewColumn
      : undefined;
    if (ArchitectureViewPanel.currentPanel) {
      ArchitectureViewPanel.currentPanel.webviewPanel.reveal(column);
    } else {
      ArchitectureViewPanel.currentPanel = new ArchitectureViewPanel(
        extContext.extensionUri,
        column || vscode.ViewColumn.One,
      );
    }
    return ArchitectureViewPanel.currentPanel;
  }

  private constructor(extensionPath: vscode.Uri, column: vscode.ViewColumn) {
    this.extensionUri = extensionPath;
    this.webviewPanel = vscode.window.createWebviewPanel(
      ArchitectureViewPanel.viewType,
      webviewTabTitle,
      column,
      {
        enableScripts: true,
        localResourceRoots: [this.extensionUri],
      },
    );

    this.webviewPanel.iconPath = vscode.Uri.joinPath(this.extensionUri, 'images', 'icon-color.png');
    this.webviewPanel.webview.html = this._getHtmlForWebview(this.webviewPanel.webview);
    this.webviewPanel.onDidDispose(() => this.dispose(), null, this._disposables);

    // Handle messages from the webview
    this.webviewPanel.webview.onDidReceiveMessage(
      (message) => {
        switch (message.type) {
          case 'startup':
            this.flushInitCallbacks();
            return;
        }
      },
      null,
      this._disposables,
    );
  }

  private flushInitCallbacks = async () => {
    console.log('App content is loaded');
    console.log(`Flashing ${this.initCallbacks.length} init callbacks`);
    this.isAppLoaded = true;
    for (const cb of this.initCallbacks) {
      await cb();
    }
    this.initCallbacks = [];
  };

  public onInit(cb: InitCallback) {
    if (this.isAppLoaded) {
      cb();
    } else {
      this.initCallbacks.push(cb);
    }
  }

  public sendAnalysisResult(data: AnalysisResult) {
    this.webviewPanel.webview.postMessage({ type: 'analysis', payload: data });
  }

  public dispose() {
    ArchitectureViewPanel.currentPanel = undefined;
    this.webviewPanel.dispose();

    while (this._disposables.length) {
      const x = this._disposables.pop();
      if (x) {
        x.dispose();
      }
    }
  }

  private _getHtmlForWebview(webview: vscode.Webview) {
    const scriptUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this.extensionUri, 'out', 'main.wv.js'),
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
