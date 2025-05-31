import { globby } from 'globby';
import * as core from '@actions/core';
import * as fs from 'fs';
import { join, basename } from 'path';
import { makeUpload } from './upload';
import { asBoolean, isDirectory } from './utils';
import { DropboxResponseError } from 'dropbox';

const src = core.getInput('src');
const dest = core.getInput('dest');
const multiple = asBoolean(core.getInput('multiple'));

const mode = core.getInput('mode') as 'overwrite' | 'add' | undefined;
const autorename = asBoolean(core.getInput('autorename'));
const mute = asBoolean(core.getInput('mute'));

const useRootNamespace = asBoolean(core.getInput('use_root_namespace'));

const refreshToken = core.getInput('dropbox_refresh_token');
const clientId = core.getInput('dropbox_client_id');
const clientSecret = core.getInput('dropbox_client_secret');

async function run() {
  try {
    const { upload, uploadLargeFile } = await makeUpload({
      refreshToken,
      clientId,
      clientSecret,
      useRootNamespace,
    });

    if (!multiple) {
      // const contents = await fs.promises.readFile(src);
      if (isDirectory(dest)) {
        const path = join(dest, basename(src));
        // await upload(path, contents, { mode, autorename, mute });
        await uploadLargeFile(src, path, { mode, autorename, mute }, (sent, total) => {
          core.info(`Uploading: ${src} -> ${path} (${sent}/${total})`);
        });
        core.info(`Uploaded: ${src} -> ${path}`);
      } else {
        // await upload(dest, contents, { mode, autorename, mute });
        await uploadLargeFile(src, dest, { mode, autorename, mute }, (sent, total) => {
          core.info(`Uploading: ${src} -> ${dest} (${sent}/${total})`);
        });
        core.info(`Uploaded: ${src} -> ${dest}`);
      }
    } else {
      const files = await globby(src);
      await Promise.all(
        files.map(async (file) => {
          const path = join(dest, file);
          // const contents = await fs.promises.readFile(file);
          // await upload(path, contents, { mode, autorename, mute });
          await uploadLargeFile(file, path, { mode, autorename, mute }, (sent, total) => {
            core.info(`Uploading: ${file} -> ${path} (${sent}/${total})`);
          });
          core.info(`Uploaded: ${file} -> ${path}`);
        })
      );
    }
  } catch (error) {
    if (error instanceof DropboxResponseError) {
      core.error(error.error);
    }
    core.setFailed(error as Error);
  }
}

void run();
