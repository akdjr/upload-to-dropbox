import { Dropbox, files } from 'dropbox';
import fetch from 'node-fetch';

export async function makeUpload(
  accessToken: string,
  useRootNamespace: boolean
): Promise<{
  upload: (
    path: string,
    contents: Buffer,
    options: {
      mode: string;
      autorename: boolean;
      mute: boolean;
    }
  ) => Promise<void>;
}> {
  let dropbox = new Dropbox({ accessToken, fetch });

  if (useRootNamespace) {
    const account = await dropbox.usersGetCurrentAccount();

    if (
      account.result.root_info.home_namespace_id !==
      account.result.root_info.root_namespace_id
    ) {
      dropbox = new Dropbox({
        accessToken,
        fetch,
        pathRoot: `{".tag": "root", "root": "${account.result.root_info.root_namespace_id}"}`,
      });
    }
  }

  return {
    upload: async (path, contents, options) => {
      await dropbox.filesUpload({
        path,
        contents,
        mode: getMode(options.mode),
        autorename: options.autorename,
        mute: options.mute,
      });
    },
  };
}

function getMode(mode: string): files.WriteMode {
  switch (mode) {
    case 'overwrite':
      return {
        '.tag': 'overwrite',
      };
    case 'add':
    default:
      return {
        '.tag': 'add',
      };
  }
}
