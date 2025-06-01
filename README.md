# Upload to Dropbox Enhanced

This github action uploads a file to Dropbox. It is a fork of [upload-to-dropbox](https://github.com/deka0106/upload-to-dropbox) by Deka. It has been updated and maintained with additional features and improvements.

## Original Project Credits

- Original Author: Deka (dekachan16@gmail.com)
- Original Repository: https://github.com/deka0106/upload-to-dropbox
- License: MIT

## Changes from Original

- Added support for using root namespace when working with Dropbox Teams
- Authorization now uses refresh token flow instead of access token (access tokens are now short lived only)
- Added support for large file uploads (files bigger than 150MB up to the Dropbox limit)
- Added option to generate a shared link (public for now, more options TBD)

[![](https://github.com/akdjr/upload-to-dropbox-action/workflows/build-test/badge.svg)](https://github.com/akdjr/upload-to-dropbox-action/actions)

## Usage

See [action.yml](action.yml)

### Setup

1. Create an app with the `files.content.write` scope on [App Console](https://www.dropbox.com/developers/apps). Optionally add `sharing.write` if you wish to use the shared_link option.
2. Save the app key and app secret as `DROPBOX_APP_KEY` and `DROPBOX_APP_SECRET` on your repository secrets.
3. Follow the OAUTH flow by going to [https://www.dropbox.com/oauth2/authorize?client_id=<APP_KEY>&token_access_type=offline&response_type=code](https://www.dropbox.com/oauth2/authorize?client_id=<APP_KEY>&token_access_type=offline&response_type=code) - replace APP_KEY with your own app key.
4. Once you allow access, take the authorization code and issue a POST request to https://api.dropbox.com/oauth2/token with the code. See [https://www.dropbox.com/developers/documentation/http/documentation](https://www.dropbox.com/developers/documentation/http/documentation) for documentation on the oauth2/token API. Specifically, you want to follow the code flow access token request. Note that redirect_uri is not used if you are following these steps.

Example curl request:

```
curl https://api.dropbox.com/oauth2/token \
-d code=<AUTHORIZATION_CODE> \
-d grant_type=authorization_code \
-d client_id=<APP_KEY> \
-d client_secret=<APP_SECRET>
```

5. The response from above will contain an access token and a refresh token. Save the resulting refresh token as `DROPBOX_REFRESH_TOKEN` on your repository secrets. Do not use the access token as that is only short lived. The refresh token will be valid unless you deauthorize your app from your account.

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

### Upload a file Using root namespace when working with Dropbox Teams

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

### Upload a file with a public shared link

```yaml
- uses: akdjr/upload-to-dropbox@v4
  with:
    dropbox_refresh_token: ${{ secrets.DROPBOX_REFRESH_TOKEN }}
    dropbox_client_id: ${{ secrets.DROPBOX_APP_KEY }}
    dropbox_client_secret: ${{ secrets.DROPBOX_APP_SECRET }}
    use_root_namespace: true
    src: dist/paper.pdf
    dest: /Shared Team Folder/paper.pdf
    shared_link: true
```
