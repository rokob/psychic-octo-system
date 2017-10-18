import idx from 'idx';

const regexsToIgnore = [
  /Branch init failed/gi,
  /GoogleAPI.*popup_closed_by_user/gi,
  /GoogleAPI.*access_denied/gi,
  /unhandled rejection was null or undefined/gi,
  /script error/gi,
  /object Object/gi,
  /GraphQL error: 503/gi,
  /GraphQL error: Unauthorized/gi,
  /GraphQL error: 401/gi,
  /Network error: Failed to fetch/gi,
  /\$ is not defined/gi,
  /event is not defined/gi,
  /maxItems has been hit. Ignoring errors until reset./gi,
  /Cannot read property 'load' of undefined/gi,
];

export function checkIgnore(isUncaught: boolean, args: Array<*>, payload: Object) {
  console.log("CHECKING: ", payload);
  try {
    if (payload.fingerprint) {
      var result = regexsToIgnore.some(pattern => payload.fingerprint.search(pattern) !== -1);
      console.log("CHECKING GOT: ", result);
      return result;
    }
    console.log("NO FINGERPRINT");
    return false;
  } catch (e) {
    // if we did this wrong, lets log it so we can track why, and send the error anyway.
    console.error(e);
    return false;
  }
}

export function transform(payload: Object) {
  const message =
    idx(payload, _ => _.body.message.body) ||
    idx(payload, _ => _.body.message) ||
    idx(payload, _ => _.body.trace.exception.message) ||
    idx(payload, _ => _.body.trace.extra.extraArgs[0].message) ||
    idx(payload, _ => _.body.trace.extra.extraArgs[1].message) ||
    idx(payload, _ => _.body.trace.extra.extraArgs[0]) ||
    idx(payload, _ => _.body.trace.extra.extraArgs[1]);

  const description =
    idx(payload, _ => _.body.trace.exception.description) ||
    idx(payload, _ => _.body.message.extra.error);

  try {
  console.log("TRANSFORM: ", message, description);
  if (typeof message === 'string' && message !== '') {
    const shouldAddDescription = typeof description === 'string' && description !== message;
    payload.fingerprint = message + (shouldAddDescription ? ` ${description || ''}` : '');
  } else if (description && typeof description === 'string') {
    payload.fingerprint = description;
  }
  } catch (e) {
    console.log("ERROR IN TRANSFORM: ", e);
  }
}

console.log("TRYING TO CONFIGURE ROLLBAR");

if (typeof window !== 'undefined' && window.Rollbar) {
console.log("WE HAVE A WINDOW AND ROLLBAR");
  const { Rollbar } = window;
  const nativeConsoleError = console.error;
  console.error = (...args) => {
    const hasError = args.some(e => e instanceof Error);
    if (hasError) {
      Rollbar.error(...args);
    } else {
      try {
        throw Error(args[0]);
      } catch (e) {
        Rollbar.error(e, ...args.slice(1));
      }
    }
    return nativeConsoleError.apply(console, args);
  };

  Rollbar.global({
    maxItems: 10,
  });

  Rollbar.configure({
    transform,
    checkIgnore,
  });
} else if (typeof window !== 'undefined') {
console.log("WE HAVE A WINDOW BUT NO ROLLBAR");
  window._rolbarTransform = transform;
  window._rollbarCheckIgnore = checkIgnore;
}
