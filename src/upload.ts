import { Dropbox, files } from 'dropbox';
import fetch from 'node-fetch';

function getAccessToken(
  refreshToken: string,
  clientId: string,
  clientSecret: string
) {
  // https://www.dropbox.com/oauth2/authorize?client_id=8d6w3qi41koo7i3&token_access_type=offline&response_type=code
}

export async function makeUpload({
  refreshToken,
  clientId,
  clientSecret,
  useRootNamespace,
}: {
  refreshToken: string;
  clientId: string;
  clientSecret: string;
  useRootNamespace: boolean;
}): Promise<{
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
  let dropbox = new Dropbox({ refreshToken, clientId, clientSecret, fetch });

  if (useRootNamespace) {
    const account = await dropbox.usersGetCurrentAccount();

    if (
      account.result.root_info.home_namespace_id !==
      account.result.root_info.root_namespace_id
    ) {
      dropbox = new Dropbox({
        refreshToken,
        clientId,
        clientSecret,
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
