self.addEventListener('install', function(event) {
    event.waitUntil(
        caches.open('mellomlager').then( function (cache) {
	    return cache.addAll([
                './index.html',
                './',
                './ikon.png',
                './manifest.webmanifest',
                './p1.txt',
                './p2.txt',
                './p3.txt',
                './p4.txt',
                './p5.txt'
              ]);
        })
    );
});


self.addEventListener('fetch', function (event) {
    event.respondWith(
        caches.match(event.request)
    );
});
