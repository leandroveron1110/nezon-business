/* -----------------------------------------------------------
   📦 SERVICE WORKER - Nezon Notificaciones Push
   ----------------------------------------------------------- */

console.log('✅ [Service Worker] Registrado y ejecutándose...');

/* -----------------------------------------------------------
   1️⃣ EVENTO PUSH - Cuando llega una notificación del servidor
   ----------------------------------------------------------- */
self.addEventListener('push', (event) => {
  console.log('📩 [Service Worker] Evento PUSH recibido:', event);

  let payload = {};
  try {
    // Intentar parsear el contenido como JSON
    payload = event.data?.json();
    console.log('🧾 Payload JSON parseado correctamente:', payload);
  } catch (e) {
    // Si no es JSON, se usa como texto plano
    const textData = event.data?.text() || 'Tienes una nueva notificación.';
    console.warn('⚠️ Fallo al parsear payload JSON. Usando texto sin formato:', textData);
    payload = {
      title: 'Notificación',
      body: textData,
      icon: '/locu-g.png',
      data: { link: '/' }
    };
  }

  const title = payload.title || 'Nueva notificación';
  const options = {
    body: payload.body || 'Tienes un nuevo mensaje.',
    icon: '/locu-g.png',
    badge: '/locu-g.png',
    data: payload.data || { link: '/' },
    requireInteraction: true, // Mantiene la notificación visible hasta que el usuario interactúe
    vibrate: [100, 50, 100],
  };

  // Mostrar la notificación, incluso si la pestaña está cerrada
  event.waitUntil(
    self.registration.showNotification(title, options)
      .then(() => console.log('✅ Notificación mostrada con éxito.'))
      .catch((err) => console.error('❌ Error al mostrar la notificación:', err))
  );
});

/* -----------------------------------------------------------
   2️⃣ EVENTO NOTIFICATIONCLICK - Al hacer clic en la notificación
   ----------------------------------------------------------- */
self.addEventListener('notificationclick', (event) => {
  console.log('🖱️ [Service Worker] Notificación clickeada:', event.notification);
  event.notification.close();

  const urlToOpen = event.notification.data?.link || '/';

  // Buscar si ya hay una pestaña abierta con esa URL
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        // Si ya está abierta esa URL, enfocar la ventana
        if (client.url.includes(urlToOpen) && 'focus' in client) {
          console.log('🔄 Enfocando ventana existente:', client.url);
          return client.focus();
        }
      }
      // Si no existe, abrir una nueva pestaña
      if (clients.openWindow) {
        console.log('🆕 Abriendo nueva pestaña:', urlToOpen);
        return clients.openWindow(urlToOpen);
      }
    })
  );
});

/* -----------------------------------------------------------
   3️⃣ EVENTOS OPCIONALES: INSTALACIÓN Y ACTIVACIÓN
   ----------------------------------------------------------- */
self.addEventListener('install', (event) => {
  console.log('📦 [Service Worker] Instalado.');
  self.skipWaiting(); // Activa inmediatamente sin esperar el reload
});

self.addEventListener('activate', (event) => {
  console.log('🚀 [Service Worker] Activado y listo para recibir notificaciones.');
  event.waitUntil(clients.claim());
});
