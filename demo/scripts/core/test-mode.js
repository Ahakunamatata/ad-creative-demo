export function detectRuntimeMode(search = globalThis.window?.location?.search ?? "") {
  const params = new URLSearchParams(search);
  return {
    testMode: params.get("testMode") === "1",
    fixture: params.get("fixture") || "",
    reset: params.get("reset") === "1"
  };
}

export function waitForLatency(mode, ms = 650) {
  if (mode?.testMode) return Promise.resolve();
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}
