#!/bin/bash

echo "Deseja iniciar o projeto usando Docker? (s/n)"
read -r resposta

if [[ "$resposta" == "s" || "$resposta" == "S" ]]; then
  echo "Iniciando com Docker Compose (modo desenvolvimento)..."
  docker compose -f docker-compose.dev.yml up --build
else
  echo "Você escolheu não usar Docker."
  echo "Para rodar manualmente:"
  echo "1. Em apps/backend:"
  echo "   pnpm install && pnpm run start:dev"
  echo ""
  echo "2. Em apps/frontend:"
  echo "   pnpm install && pnpm run dev"
fi
