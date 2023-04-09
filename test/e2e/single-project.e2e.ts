import { Workbench } from 'wdio-vscode-service';

describe('Architecture view extension', () => {

  it('should load the workspace', async () => {
    const workbench: Workbench = await browser.getWorkbench();
    expect(await workbench.getTitleBar().getTitle()).toContain(
      '[Extension Development Host] guinea-pig-nestjs',
    );
  });

  it('should load the architecture view', async () => {
    const workbench: Workbench = await browser.getWorkbench();
    await workbench.executeCommand('showArchitecture');
    await browser.pause(500);
    const archWebview = await workbench.getWebviewByTitle('Architecture View');
    await archWebview.open();
    const nodes = await $$('.react-flow__node-actual');
    expect(nodes.length).toBe(8);
    const nodesText = await Promise.all(nodes.map(node => node.getText()));
    expect(nodesText).toContain('AppController\ngetHello');
  });
});
