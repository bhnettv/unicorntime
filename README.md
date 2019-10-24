# unicorntime

You can switch between mocked API and server API.

To switch, specify `server` or `mock` in .env file.  

You'll need OAuth 1.0 consumerKey, consumerSecret, token and secret to communicate with the live server API.
Click on the settings button in bottom right corner to specify them as a Base64 encoded string.

Example:
```
const obj = {
  consumerKey: '',
  consumerSecret: '',
  token: '',
  secret: ''
};
const base64string = btoa(JSON.stringify(obj));
```

## Requirements

[MPV](https://mpv.io/) player is required. Download and add it to your PATH.

```
mpv --version
```

## Project setup

```
yarn install
```

### Compiles and hot-reloads for development

```
yarn serve
```

### Compiles and minifies for production

```
yarn build
```

### Lints and fixes files

```
yarn lint
```