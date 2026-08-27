# PokéBinder

PokéBinder is a personal Pokémon TCG collection tracker for cards, albums, favorites, expansions, artists, and Pokédex progress.

## Development

```bash
npm install
npm run dev
```

## Checks

```bash
npm run lint
npm run typecheck
npm run build
```

## Deploy

This app is built as static files and can be served from a VPS with Nginx.

### GitHub Secrets

Create these repository secrets in GitHub:

```txt
VPS_HOST=your.server.ip.or.domain
VPS_PORT=22
VPS_USER=deploy
VPS_SSH_KEY=private SSH key for the deploy user
DEPLOY_PATH=/var/www/pokebinder
```

The deploy workflow runs on pushes to `main` and can also be started manually
from the GitHub Actions tab.

### VPS Setup

Create a deploy directory and make sure the deploy user can write to it:

```bash
sudo mkdir -p /var/www/pokebinder
sudo chown -R deploy:deploy /var/www/pokebinder
```

Install Nginx and copy the provided config:

```bash
sudo cp nginx/pokebinder.conf /etc/nginx/sites-available/pokebinder
sudo ln -s /etc/nginx/sites-available/pokebinder /etc/nginx/sites-enabled/pokebinder
sudo nginx -t
sudo systemctl reload nginx
```

Before enabling it, edit `nginx/pokebinder.conf` and replace:

```txt
pokebinder.example.com
/var/www/pokebinder
```

with your real domain and deploy path.

### HTTPS

PWA install support and service workers require HTTPS outside localhost.
After DNS points to the VPS, use Certbot:

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

### React Router

The Nginx config includes:

```nginx
try_files $uri $uri/ /index.html;
```

That keeps direct URLs like `/albums/123` working after refresh.
