To use this demo, run the following:

```
$ yarn install
$ ./node_modules/.bin/webpack
$ yarn start
```

Then open http://localhost:3000/index in your browser and look at the console output.


- `yarn test` runs the tests which show that the transform and checkIgnore functions work on the
given output.

- `yarn start` starts a server which has one html document at `http://localhost:3000/index`

- Running `webpack` in this directory builds `dist/main.js` which is the "app" code which
  reconfigures Rollbar.

- `bork.js` is a file that when loaded will raise an exception

- `rollbar.umd.js` is copied from the dist directory of rollbar.js, I added some console output at
  various places to see things that are happening. I used `rollbarJsUrl` in the config to load this
  via the running server.

- Navigating to the page via `localhost:3000/index` and loading `bork.js` via `0.0.0.0:3000/bork.js`
will result in a CORS issue with the exception and therefore a "Script Error".

The page that loads has two interesting lines:

```html
<script src="main.js"></script>
<script src="http://0.0.0.0:3000/bork.js"></script>
```

In the order presented above, Rollbar will be configured before the error is thrown by the script
and thus the updated checkIgnore and transform functions will be used.

If you reverse the order of those lines, then the script error gets thrown before configure gets
called, and therefore the original checkIgnore and transform functions will be used.
