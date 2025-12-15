// configuration for the API
// Change this URL when deploying to production
// For local development, keep it as 'http://127.0.0.1:5000'
// For WhoGoHost, change it to your subdomain, e.g., 'https://api.yourdomain.ng'

const isLocalhost = Boolean(
    window.location.hostname === 'localhost' ||
    window.location.hostname === '[::1]' ||
    window.location.hostname.match(
        /^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/
    )
);

export const API_BASE_URL = isLocalhost ? 'http://127.0.0.1:5000' : '';
