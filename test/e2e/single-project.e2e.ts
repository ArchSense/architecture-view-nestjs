import { browser, expect } from '@wdio/globals';

describe('Architecture view extension', () => {
  it('should render architecture for single root nestjs project', async () => {
    const workbench = await browser.getWorkbench();
    expect(await workbench.getTitleBar().getTitle()).toBe(
      '[Extension Development Host] guinea-pig-nestjs',
    );
  });
});
