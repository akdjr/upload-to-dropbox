import token from './token'
import { Dropbox } from 'dropbox'

async function main() {
  const dropbox = new Dropbox({ accessToken: token })

  const account = await dropbox.usersGetCurrentAccount()
  console.log(account)

  const folders = await dropbox.filesListFolder({ path: '' })
  console.log(folders)

  for (const entry of folders.result.entries) {
    if (entry['.tag'] === 'folder') {
      console.log(entry.path_display)
    }
  }

  const dropboxWithRoot = new Dropbox({
    accessToken: token,
    pathRoot: `{".tag": "root", "root": "${account.result.root_info.root_namespace_id}"}`,
  })

  const foldersWithRoot = await dropboxWithRoot.filesListFolder({ path: '' })
  console.log(foldersWithRoot)

  for (const entry of foldersWithRoot.result.entries) {
    if (entry['.tag'] === 'folder') {
      console.log(entry.path_display)
    }
  }
}

void main()
