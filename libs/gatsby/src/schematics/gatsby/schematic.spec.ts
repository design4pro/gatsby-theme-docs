import { Tree } from '@angular-devkit/schematics';
import { SchematicTestRunner } from '@angular-devkit/schematics/testing';
import { createEmptyWorkspace } from '@nrwl/workspace/testing';
import { join } from 'path';
import { GatsbySchematicSchema } from './schema';

describe('gatsby schematic', () => {
  let appTree: Tree;
  const options: GatsbySchematicSchema = { name: 'test' };

  const testRunner = new SchematicTestRunner(
    '@design4pro/gatsby',
    join(__dirname, '../../../collection.json')
  );

  beforeEach(() => {
    appTree = createEmptyWorkspace(Tree.empty());
  });

  it('should run successfully', async () => {
    await expect(
      testRunner.runSchematicAsync('gatsby', options, appTree).toPromise()
    ).resolves.not.toThrowError();
  });
});
