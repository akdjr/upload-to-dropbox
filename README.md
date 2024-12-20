# Upload to Dropbox

This github action uploads a file to Dropbox. It is a fork of [upload-to-dropbox](https://github.com/deka0106/upload-to-dropbox) by Deka. It has been updated and maintained with additional features and improvements.

## Original Project Credits

- Original Author: Deka (dekachan16@gmail.com)
- Original Repository: https://github.com/deka0106/upload-to-dropbox
- License: MIT

## Changes from Original

- Added support for using root namespace when working with Dropbox Teams

[![](https://github.com/akdjr/upload-to-dropbox-action/workflows/build-test/badge.svg)](https://github.com/akdjr/upload-to-dropbox-action/actions)

## Usage

See [action.yml](action.yml)

### Setup

Generate an access token that has `files.content.write` permission on [App Console](https://www.dropbox.com/developers/apps).

Save the token as `DROPBOX_ACCESS_TOKEN` on your repository Secrets.

### Upload a file

```yaml
- uses: akdjr/upload-to-dropbox@v3
  with:
    dropbox_access_token: ${{ secrets.DROPBOX_ACCESS_TOKEN }}
    src: dist/paper.pdf
    dest: /thesis/
```

### Upload a file with overwrite mode

```yaml
- uses: akdjr/upload-to-dropbox@v3
  with:
    dropbox_access_token: ${{ secrets.DROPBOX_ACCESS_TOKEN }}
    src: dist/paper.pdf
    dest: /thesis/
    mode: overwrite
```

### Upload a file with specified name

```yaml
- uses: akdjr/upload-to-dropbox@v3
  with:
    dropbox_access_token: ${{ secrets.DROPBOX_ACCESS_TOKEN }}
    src: dist/paper.pdf
    dest: /thesis/my-thesis.pdf
```

### Upload multiple files

```yaml
- uses: akdjr/upload-to-dropbox@v3
  with:
    dropbox_access_token: ${{ secrets.DROPBOX_ACCESS_TOKEN }}
    src: dist/**/*
    dest: /dest/
    multiple: true
```

### Using root namespace when working with Dropbox Teams

```yaml
- uses: akdjr/upload-to-dropbox@v3
  with:
    dropbox_access_token: ${{ secrets.DROPBOX_ACCESS_TOKEN }}
    use_root_namespace: true
    src: dist/paper.pdf
    dest: /Shared Team Folder/paper.pdf
```
