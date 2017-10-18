import expect from 'expect';
import { transform, checkIgnore } from '../setuperror';

describe('setupErrorLogging', () => {
  const errorsToSend = [
    {
      body: {
        trace: {
          exception: {
            message: 'Received 401 after finding a window user',
            class: 'Error',
          },
        },
      },
    },
    {
      body: {
        message: 'abcdefghijklmnopqurstuvwxyz1234567890',
      },
    },
  ];

  const errorsToIgnore = [
    {
      body: {
        trace: {
          exception: {
            message: 'Request blocked by client, probably adblock',
            class: 'Error',
            description: 'Branch init failed',
          },
        },
      },
    },
    {
      body: {
        message: {
          body: 'GoogleAPI fetchAuthorizationCode failed',
          extra: {
            error: 'popup_closed_by_user',
          },
        },
      },
    },
    {
      body: {
        trace: {
          exception: {
            message: 'unhandled rejection was null or undefined!',
            class: '(unknown)',
            description: 'unhandled rejection was null or undefined!',
          },
        },
      },
    },
    {
      body: {
        trace: {
          exception: {
            message: 'Script error.',
            class: '(unknown)',
            description: 'Script error.',
          },
        },
      },
    },
    {
      body: {
        trace: {
          exception: {
            message: 'Unhandled error',
            class: 'Error',
            description: 'GraphQL error: Unauthorized',
          },
          extra: {
            extraArgs: [
              'Error: GraphQL error: Unauthorized\n    at new t (https://d32zu3mt2bvf74.cloudfront.net/assets/dll.vendor_7220b67f6999fe47e18e.js:1:82572)\n    at https://d32zu3mt2bvf74.cloudfront.net/assets/dll.vendor_7220b67f6999fe47e18e.js:1:49350\n    at https://d32zu3mt2bvf74.cloudfront.net/assets/dll.vendor_7220b67f6999fe47e18e.js:1:59168\n    at Array.forEach (<anonymous>)\n    at https://d32zu3mt2bvf74.cloudfront.net/assets/dll.vendor_7220b67f6999fe47e18e.js:1:59142\n    at Array.forEach (<anonymous>)\n    at e.broadcastQueries (https://d32zu3mt2bvf74.cloudfront.net/assets/dll.vendor_7220b67f6999fe47e18e.js:1:59091)\n    at https://d32zu3mt2bvf74.cloudfront.net/assets/dll.vendor_7220b67f6999fe47e18e.js:1:58142\n    at <anonymous>',
            ],
          },
        },
      },
    },
    {
      body: {
        trace: {
          exception: {
            message: "Cannot read property 'load' of undefined",
            class: 'TypeError',
            description: "Uncaught TypeError: Cannot read property 'load' of undefined",
          },
        },
      },
    },
    {
      body: {
        trace: {
          exception: {
            message: '0',
            class: 'Error',
            description: 'Branch init failed',
          },
        },
      },
    },
  ];

  errorsToSend.forEach(payload => {
    transform(payload); // mutates the payload
    it(`should send with fingerprint ${payload.fingerprint}`, () => {
      expect(checkIgnore(false, [], payload)).toBe(false);
    });
  });

  errorsToIgnore.forEach(payload => {
    transform(payload); // mutates the payload
    it(`should ignore with fingerprint ${payload.fingerprint}`, () => {
      expect(checkIgnore(false, [], payload)).toBe(true);
      expect(checkIgnore(false, [], payload)).toBe(true); // testing twice becaused regexs are stateful
    });
  });
});
