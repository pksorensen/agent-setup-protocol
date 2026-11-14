export function GET(): Response {
    return new Response('Healthy', {
        headers: { 'content-type': 'text/plain; charset=utf-8' },
    });
}
