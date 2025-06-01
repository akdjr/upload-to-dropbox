import { Dropbox, files } from 'dropbox';
import fetch from 'node-fetch';
import { promises as fs } from 'fs';

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
      mode?: 'overwrite' | 'add';
      autorename: boolean;
      mute: boolean;
    }
  ) => Promise<void>,
  uploadLargeFile: (
    localPath: string,
    dropboxPath: string,
    options: {
      mode?: 'overwrite' | 'add';
      autorename: boolean;
      mute: boolean;
    },
    onProgress?: (sent: number, total: number) => void
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
    uploadLargeFile: async (localPath, dropboxPath, options, onProgress) => {
      await uploadLargeFile(dropbox, localPath, dropboxPath, options, onProgress);
    },
  };
}

function getMode(mode?: 'overwrite' | 'add'): files.WriteMode {
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

const MAX_CHUNK   = 150 * 1024 * 1024;     // Dropbox’s per-request upload cap
const CHUNK_SIZE  = 100 * 1024 * 1024;     // 100 MiB  (exactly 25 × 4 MiB)

/**
 * Upload any-size local file to Dropbox in 100 MiB (4 MiB-aligned) blocks.
 *
 * • For files ≤ 150 MiB we fall back to a single `filesUpload` call.  
 * • For larger files we stream them with the upload-session trio:
 *   - filesUploadSessionStart
 *   - filesUploadSessionAppendV2   (all multiples of 4 MiB)
 *   - filesUploadSessionFinish
 */
async function uploadLargeFile(
  dbx: Dropbox,
  localPath: string,
  dropboxPath: string,
  options: {
    mode?: 'overwrite' | 'add';
    autorename: boolean;
    mute: boolean;
  },
  onProgress?: (sent: number, total: number) => void
): Promise<void> {
  const fh            = await fs.open(localPath, "r");
  const { size }      = await fh.stat();
  const totalBytes    = size;

  // ---------- Small files: simple upload ------------------------------------
  if (totalBytes <= MAX_CHUNK) {
    const buffer = Buffer.allocUnsafe(totalBytes);
    await fh.read(buffer, 0, totalBytes, 0);
    await fh.close();

    const res = await dbx.filesUpload({
      path: dropboxPath,
      contents: buffer,
      mode: getMode(options.mode),
      autorename: options.autorename,
      mute: options.mute,
      strict_conflict: false,
    });

    onProgress?.(totalBytes, totalBytes);
    return;
  }

  // ---------- Large files: upload-session strategy --------------------------
  let offset    = 0;
  let sessionId = "";

  try {
    let chunk = Buffer.allocUnsafe(CHUNK_SIZE);
    // -- 1) Start session with first 100 MiB block ---------------------------
    await fh.read(chunk, 0, CHUNK_SIZE, offset);

    const { result } = await dbx.filesUploadSessionStart({
      close: false,
      contents: chunk,
    });
    sessionId = result.session_id;

    offset += CHUNK_SIZE;
    onProgress?.(offset, totalBytes);
    
    // -- 2) Append every full 100 MiB block (each multiple of 4 MiB) ---------
    while (totalBytes - offset > CHUNK_SIZE) {
      await fh.read(chunk, 0, CHUNK_SIZE, offset);

      await dbx.filesUploadSessionAppendV2({
        cursor: { session_id: sessionId, offset },
        close : false,
        contents: chunk,
      });

      offset += CHUNK_SIZE;
      onProgress?.(offset, totalBytes);
    }

    // -- 3) Finish with the remaining bytes (< 100 MiB, any length) ----------
    const remaining = totalBytes - offset;
    await fh.read(chunk, 0, remaining, offset);

    const finishRes = await dbx.filesUploadSessionFinish({
      cursor: { session_id: sessionId, offset },
      commit: {
        path: dropboxPath,
        mode: getMode(options.mode),
        autorename: options.autorename,
        mute: options.mute,
        strict_conflict: false,
      },
      contents: chunk,
    });

    onProgress?.(totalBytes, totalBytes);
    return;
  } finally {
    await fh.close();
  }
}
