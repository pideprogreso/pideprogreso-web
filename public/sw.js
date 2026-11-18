// Service worker de PideProgreso: hace la app instalable y muestra los avisos (Web Push).
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (e) => e.waitUntil(self.clients.claim()));

// El sitio manda { title, body, url, tag } (ver src/app/api/avisos/route.ts).
self.addEventListener("push", (e) => {
  const aviso = e.data ? e.data.json() : { title: "PideProgreso", body: "", url: "/" };
  e.waitUntil(
    self.registration.showNotification(aviso.title, {
      body: aviso.body,
      tag: aviso.tag,
      renotify: Boolean(aviso.tag),
      icon: "/icono-192.png",
      badge: "/icono-insignia.png",
      vibrate: [300, 150, 300],
      data: { url: aviso.url || "/" },
    }),
  );
});

self.addEventListener("notificationclick", (e) => {
  e.notification.close();
  const url = (e.notification.data && e.notification.data.url) || "/panel";
  e.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((ventanas) => {
      const misma = ventanas.find((v) => new URL(v.url).pathname === url);
      if (misma) return misma.focus();
      const cualquiera = ventanas[0];
      return cualquiera ? cualquiera.focus().then((v) => v.navigate(url)) : self.clients.openWindow(url);
    }),
  );
});
