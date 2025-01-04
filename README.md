# Upload to Dropbox

This github action uploads a file to Dropbox. It is a fork of [upload-to-dropbox](https://github.com/deka0106/upload-to-dropbox) by Deka. It has been updated and maintained with additional features and improvements.

## Original Project Credits

- Original Author: Deka (dekachan16@gmail.com)
- Original Repository: https://github.com/deka0106/upload-to-dropbox
- License: MIT

## Changes from Original

- Added support for using root namespace when working with Dropbox Teams
- Authorization now uses refresh token flow instead of access token (access tokens are now short lived only)

[![](https://github.com/akdjr/upload-to-dropbox-action/workflows/build-test/badge.svg)](https://github.com/akdjr/upload-to-dropbox-action/actions)

## Usage

See [action.yml](action.yml)

### Setup

1. Create an app with the `files.content.write` scope on [App Console](https://www.dropbox.com/developers/apps).
2. Save the app key and app secret as `DROPBOX_APP_KEY` and `DROPBOX_APP_SECRET` on your repository secrets.
3. Follow the OAUTH flow by going to [https://www.dropbox.com/oauth2/authorize?client_id=<APP_KEY>&token_access_type=offline&response_type=code](https://www.dropbox.com/oauth2/authorize?client_id=<APP_KEY>&token_access_type=offline&response_type=code) - replace APP_KEY with your own app key. Once you allow access, take the authorization code and issue a POST request to https://api.dropbox.com/oauth2/token with the code (see [https://www.dropbox.com/developers/documentation/http/documentation](https://www.dropbox.com/developers/documentation/http/documentation) for documentation on the oauth2/token API).
4. Save the resulting refresh token as `DROPBOX_REFRESH_TOKEN` on your repository secrets. Do not use the access token as that is only short lived. The refresh token will be valid unless you deauthorize your app from your account.

### Upload a file

```yaml
- uses: akdjr/upload-to-dropbox@v4
  with:
    dropbox_refresh_token: ${{ secrets.DROPBOX_REFRESH_TOKEN }}
    dropbox_client_id: ${{ secrets.DROPBOX_APP_KEY }}
    dropbox_client_secret: ${{ secrets.DROPBOX_APP_SECRET }}
    src: dist/paper.pdf
    dest: /thesis/
```

### Upload a file with overwrite mode

```yaml
- uses: akdjr/upload-to-dropbox@v4
  with:
    dropbox_refresh_token: ${{ secrets.DROPBOX_REFRESH_TOKEN }}
    dropbox_client_id: ${{ secrets.DROPBOX_APP_KEY }}
    dropbox_client_secret: ${{ secrets.DROPBOX_APP_SECRET }}
    src: dist/paper.pdf
    dest: /thesis/
    mode: overwrite
```

### Upload a file with specified name

```yaml
- uses: akdjr/upload-to-dropbox@v4
  with:
    dropbox_refresh_token: ${{ secrets.DROPBOX_REFRESH_TOKEN }}
    dropbox_client_id: ${{ secrets.DROPBOX_APP_KEY }}
    dropbox_client_secret: ${{ secrets.DROPBOX_APP_SECRET }}
    src: dist/paper.pdf
    dest: /thesis/my-thesis.pdf
```

### Upload multiple files

```yaml
- uses: akdjr/upload-to-dropbox@v4
  with:
    dropbox_refresh_token: ${{ secrets.DROPBOX_REFRESH_TOKEN }}
    dropbox_client_id: ${{ secrets.DROPBOX_APP_KEY }}
    dropbox_client_secret: ${{ secrets.DROPBOX_APP_SECRET }}
    src: dist/**/*
    dest: /dest/
    multiple: true
```

### Using root namespace when working with Dropbox Teams

```yaml
- uses: akdjr/upload-to-dropbox@v4
  with:
    dropbox_refresh_token: ${{ secrets.DROPBOX_REFRESH_TOKEN }}
    dropbox_client_id: ${{ secrets.DROPBOX_APP_KEY }}
    dropbox_client_secret: ${{ secrets.DROPBOX_APP_SECRET }}
    use_root_namespace: true
    src: dist/paper.pdf
    dest: /Shared Team Folder/paper.pdf
```
