import { DEFAULT_ONYX_DOMAIN } from "./constants.js";

export async function getOnyxDomain() {
  const result = await chrome.storage.local.get({
    onyxDomain: DEFAULT_ONYX_DOMAIN,
  });
  return result.onyxDomain;
}

export function setOnyxDomain(domain, callback) {
  chrome.storage.local.set({ onyxDomain: domain }, callback);
}

export function getOnyxDomainSync() {
  return new Promise((resolve) => {
    getOnyxDomain(resolve);
  });
}
