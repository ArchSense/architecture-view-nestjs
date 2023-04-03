import { Workbench } from 'wdio-vscode-service';

describe('Architecture view extension', () => {
  it('should load the workspace', async () => {
    const workbench: Workbench = await browser.getWorkbench();
    expect(await workbench.getTitleBar().getTitle()).toContain(
      '[Extension Development Host] guinea-pig-nestjs',
    );
  });
});
