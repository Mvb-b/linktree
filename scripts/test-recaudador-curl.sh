#!/bin/bash

# =====================================================
# Script de prueba del Agente Recaudador usando curl
# =====================================================

# Configuración
CRON_SECRET="${CRON_SECRET:-dev-secret-123}"
ENDPOINT="${1:-http://localhost:3000/api/cron/recaudador}"

echo "=================================================="
echo "🤖 Test del Agente Recaudador (cURL)"
echo "=================================================="
echo "URL: $ENDPOINT"
echo "=================================================="
echo ""

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "⏳ Ejecutando petición POST..."
echo ""

# Ejecutar petición
response=$(curl -s -w "\n%{http_code}" -X POST "$ENDPOINT" \
  -H "Authorization: Bearer $CRON_SECRET" \
  -H "Content-Type: application/json")

# Separar body y status code
http_code=$(echo "$response" | tail -n1)
body=$(echo "$response" | sed '$d')

echo "📡 Status Code: $http_code"
echo ""

# Verificar respuesta
case $http_code in
  200)
    echo -e "${GREEN}✅ ÉXITO: El endpoint respondió correctamente${NC}"
    echo ""
    echo "📊 Respuesta:"
    echo "$body" | python3 -m json.tool 2>/dev/null || echo "$body"
    
    # Extraer información útil si está disponible
    if echo "$body" | grep -q '"success":true'; then
      echo ""
      echo -e "${GREEN}🎉 Agente recaudador ejecutado exitosamente!${NC}"
    fi
    ;;
    
  401)
    echo -e "${YELLOW}⚠️  ERROR 401: No autorizado${NC}"
    echo ""
    echo "El CRON_SECRET es inválido o falta. Verifica:"
    echo "  1. Tu archivo .env.local"
    echo "  2. Que el header Authorization esté bien formateado"
    ;;
    
  404)
    echo -e "${RED}❌ ERROR 404: Endpoint no encontrado{NC}"
    echo ""
    echo "Verifica que:"
    echo "  1. El archivo route.ts existe en app/api/cron/recaudador/"
    echo "  2. El servidor esté corriendo (npm run dev)"
    echo "  3. La URL sea correcta"
    ;;
    
  500)
    echo -e "${RED}❌ ERROR 500: Error interno del servidor{NC}"
    echo ""
    echo "Respuesta:"
    echo "$body"
    echo ""
    echo "Revisa los logs del servidor para más detalles."
    ;;
    
  000)
    echo -e "${RED}❌ ERROR: No se pudo conectar al servidor${NC}"
    echo ""
    echo "Posibles causas:"
    echo "  - El servidor no está corriendo"
    echo "  - La URL es incorrecta"
    echo "  - Problema de red/firewall"
    echo ""
    echo "Para iniciar el servidor:"
    echo "  npm run dev"
    ;;
    
  *)
    echo -e "${YELLOW}⚠️  Respuesta inesperada: HTTP $http_code${NC}"
    echo ""
    echo "$body" | python3 -m json.tool 2>/dev/null || echo "$body"
    ;;
esac

echo ""
echo "=================================================="

# También probar GET
echo ""
echo "Probando método GET (también soportado)..."
response_get=$(curl -s -w "\n%{http_code}" -X GET "$ENDPOINT" \
  -H "Authorization: Bearer $CRON_SECRET")
http_code_get=$(echo "$response_get" | tail -n1)
echo "GET Status: $http_code_get"
