export async function getOnyxDomain() {
  const result = await chrome.storage.local.get({
    onyxDomain: "http://localhost:3000/chat",
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
