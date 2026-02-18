# Setup - MisraVB LinkTree

## Twitch API Real (Opcional)

Para mostrar el estado real de stream en vivo:

1. Ve a https://dev.twitch.tv/console
2. Crea una nueva app
3. Copia el Client ID y genera un Client Secret
4. Configura las variables de entorno en Coolify:

```
TWITCH_CLIENT_ID=tu_client_id_aqui
TWITCH_CLIENT_SECRET=tu_client_secret_aqui
```

Sin estas variables, el componente mostrará "Offline" con fallback.

## Avatar Personalizado

1. Sube tu foto de perfil a `/public/avatar.jpg`
2. Tamaño recomendado: 400x400px (cuadrado)
3. Formatos soportados: JPG, PNG, WEBP
4. Si no hay imagen, muestra el ícono 🔥 por defecto

## Estructura de Archivos

```
/public
  /avatar.jpg          # Tu foto de perfil (opcional)
```

## Variables de Entorno Opcionales

| Variable | Descripción | Requerido |
|----------|-------------|-----------|
| `TWITCH_CLIENT_ID` | Twitch API Client ID | No |
| `TWITCH_CLIENT_SECRET` | Twitch API Secret | No |

## Deploy

El proyecto se despliega automáticamente con cada push a `main` via Coolify.
