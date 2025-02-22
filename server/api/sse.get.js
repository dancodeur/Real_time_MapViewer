export default defineEventHandler((event)=>{
    const res = event.node.res;
    
    // Définir correctement le header pour SSE
    res.writeHead(200, {
        'Content-Type': 'text/event-stream',  // ← Important
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
    });

    // Fonction pour envoyer les événements SSE
    const sendEvent = (data) => {
        res.write(`data: ${JSON.stringify(data)}\n\n`); // ← Important
    }

    // Envoyer l'heure toutes les 5 secondes
    const interval = setInterval(() => {
        sendEvent({ time: new Date().toISOString() });
    }, 5000);

    // Fermer la connexion lorsque le client se déconnecte
    event.node.req.on('close', () => {
        clearInterval(interval);
        res.end();
    });
}); 
