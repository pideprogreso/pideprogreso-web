// Service worker mínimo: solo para mostrar avisos de pedidos nuevos en el celular.
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (e) => e.waitUntil(self.clients.claim()));
self.addEventListener("notificationclick", (e) => {
  e.notification.close();
  e.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((ventanas) => {
      const panel = ventanas.find((v) => new URL(v.url).pathname.startsWith("/panel"));
      return panel ? panel.focus() : self.clients.openWindow("/panel");
    }),
  );
});
