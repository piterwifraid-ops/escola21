#!/bin/bash

################################################################################
#                                                                              #
#              🚀 PUSH PARA GITHUB - ESCOLA PIX                              #
#                                                                              #
#  Este script faz o push do projeto para o repositório GitHub                #
#                                                                              #
################################################################################

echo ""
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║                                                                ║"
echo "║          🚀 PUSH PARA GITHUB - ESCOLA PIX 🚀                  ║"
echo "║                                                                ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

cd "/Users/visiondigitall/Documents/escola22-main 4 copy"

echo "📋 Verificando status do repositório..."
echo ""
git status

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🔑 IMPORTANTE - AUTENTICAÇÃO NO GITHUB"
echo ""
echo "Para fazer push, você precisa de uma dessas opções:"
echo ""
echo "OPÇÃO 1: GitHub CLI (Recomendado)"
echo "────────────────────────────────────"
echo "$ brew install gh"
echo "$ gh auth login"
echo "$ git push -u origin main"
echo ""
echo "OPÇÃO 2: SSH Key"
echo "────────────────────────────────────"
echo "$ ssh-keygen -t ed25519 -C 'seu-email@gmail.com'"
echo "$ cat ~/.ssh/id_ed25519.pub  # Copie e adicione em GitHub Settings"
echo "$ git push -u origin main"
echo ""
echo "OPÇÃO 3: Personal Access Token"
echo "────────────────────────────────────"
echo "1. Vá para: https://github.com/settings/tokens"
echo "2. Clique em 'Generate new token'"
echo "3. Selecione scopes: repo, read:user"
echo "4. Copie o token gerado"
echo "5. Execute:"
echo "   git remote set-url origin https://SEU_TOKEN@github.com/piterwifraid-ops/escola-pix.git"
echo "   git push -u origin main"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📊 Status do Projeto:"
echo "   • Arquivos: 85"
echo "   • Tamanho: ~17 MB"
echo "   • Branch: main"
echo "   • Commit: first commit"
echo ""
echo "✅ Repositório pronto para push!"
echo ""
echo "Use uma das opções acima e execute:"
echo "   git push -u origin main"
echo ""
echo "Após o push, você poderá ver o projeto em:"
echo "   https://github.com/piterwifraid-ops/escola-pix"
echo ""
