const CACHE_NAME = "pokebinder-v4"
const BASE_PATH = new URL(self.registration.scope).pathname.replace(/\/$/, "")
const fromBase = (path) => `${BASE_PATH}${path}`
const APP_SHELL = [
  fromBase("/"),
  fromBase("/offline.html"),
  fromBase("/manifest.webmanifest"),
  fromBase("/pokebinder.svg"),
]

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) =>
        cache.addAll(
          APP_SHELL.map((url) => new Request(url, { cache: "reload" }))
        )
      )
  )
  self.skipWaiting()
})

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key !== CACHE_NAME)
            .map((key) => caches.delete(key))
        )
      )
  )
  self.clients.claim()
})

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") {
    return
  }

  const url = new URL(event.request.url)

  if (url.origin !== self.location.origin) {
    return
  }

  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request).catch(() =>
        caches
          .match(event.request)
          .then(
            (response) => response || caches.match(fromBase("/offline.html"))
          )
      )
    )
    return
  }

  if (url.pathname.startsWith(fromBase("/assets/"))) {
    event.respondWith(
      caches.match(event.request).then(
        (cachedResponse) =>
          cachedResponse ||
          fetch(event.request).then((response) => {
            if (!response.ok) {
              return response
            }

            const copy = response.clone()

            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, copy)
            })

            return response
          })
      )
    )
    return
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        if (!response.ok) {
          return response
        }

        const copy = response.clone()

        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, copy)
        })

        return response
      })
      .catch(() =>
        caches
          .match(event.request)
          .then(
            (response) => response || caches.match(fromBase("/offline.html"))
          )
      )
  )
})
