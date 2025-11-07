---
title: "Problemas de Login e Acesso"
category: "troubleshooting"
tags: ["login", "senha", "cpf", "acesso", "erro"]
version: "3.0.0"
lastUpdate: "2025-11-07"
author: "Sistema"
aiContext: true
difficulty: "básico"
---

# Problemas de Login e Acesso

Soluções para problemas comuns ao tentar acessar o sistema.

## 🔴 Erro: "CPF não encontrado"

### Causas Possíveis

1. **CPF não cadastrado** no sistema
2. **CPF digitado incorretamente**
3. **Você está em outra organização** (não tem acesso)

### Soluções

#### Solução 1: Verificar CPF
```
✅ Digite apenas números
❌ NÃO digite: 123.456.789-00
✅ Digite: 12345678900
```

#### Solução 2: Confirmar Cadastro
- Entre em contato com seu **administrador**
- Peça para verificar se seu CPF está cadastrado
- Se não estiver, peça para ser criado como usuário

#### Solução 3: Verificar Organização Correta
- Você pode estar tentando acessar link de **outra organização**
- Peça ao administrador o **link correto** da sua organização

## 🔴 Erro: "Senha incorreta"

### Causas Possíveis

1. **Senha digitada errada**
2. **Caps Lock ativado**
3. **Senha ainda é a temporária** mas você esqueceu
4. **Você já trocou a senha** e esqueceu qual é

### Soluções

#### Solução 1: Verificar Senha Temporária
Se é seu **primeiro acesso**, a senha é:
```
Sisgead@2024
```
(exatamente assim - com S maiúsculo e @ no lugar do a)

#### Solução 2: Verificar Caps Lock
- Certifique-se que **Caps Lock está DESATIVADO**
- Senhas diferenciam maiúsculas de minúsculas

#### Solução 3: Redefinir Senha
1. Entre em contato com seu **administrador**
2. Peça para **redefinir sua senha**
3. Ele vai voltar para `Sisgead@2024`
4. Você será **forçado a criar nova senha** no próximo login

## 🔴 Erro: "Conta bloqueada"

### Por que acontece?

Após **5 tentativas de login falhadas**, o sistema bloqueia sua conta por segurança.

### Como Resolver

**Apenas o administrador pode desbloquear:**

1. Entre em contato com **administrador da sua organização**
2. Peça para **redefinir sua senha**
3. Isso **desbloqueia automaticamente** a conta
4. Faça login com senha temporária `Sisgead@2024`
5. Crie nova senha forte

⚠️ **Dica**: Guarde sua senha em local seguro para evitar bloqueios.

## 🔴 Erro: "Você deve alterar sua senha"

### Por que acontece?

Você está usando a **senha temporária** `Sisgead@2024`.

### Como Resolver

1. Digite a senha temporária para entrar
2. Sistema pedirá para **criar nova senha**
3. **Requisitos da nova senha**:
   - Mínimo 8 caracteres
   - Pelo menos 1 maiúscula (A-Z)
   - Pelo menos 1 minúscula (a-z)
   - Pelo menos 1 número (0-9)
   - Pelo menos 1 caractere especial (@#$%&*)

4. Digite a nova senha
5. **Confirme** a nova senha
6. Clique em **Salvar**

### Exemplos de Senhas Válidas
```
✅ Minhasenha@2025
✅ Admin#2024Forte
✅ Trabalho$123Seguro
❌ senha123 (sem maiúscula, sem especial)
❌ SENHA@2024 (sem minúscula)
❌ Senha (menos de 8 caracteres)
```

## 🔴 Página em Branco após Login

### Causas Possíveis

1. **Cache do navegador**
2. **Erro de JavaScript**
3. **Navegador desatualizado**
4. **Extensões do navegador** bloqueando

### Soluções

#### Solução 1: Limpar Cache
```
1. Pressione Ctrl+Shift+Del (Windows) ou Cmd+Shift+Del (Mac)
2. Selecione "Todo o período"
3. Marque "Imagens e arquivos em cache"
4. Clique em "Limpar dados"
5. Feche e reabra o navegador
```

#### Solução 2: Verificar Console (F12)
```
1. Pressione F12
2. Vá para aba "Console"
3. Veja se há erros em vermelho
4. Tire print e envie para administrador
```

#### Solução 3: Testar em Modo Anônimo
```
1. Abra janela anônima/privada
   • Chrome: Ctrl+Shift+N
   • Firefox: Ctrl+Shift+P
   • Edge: Ctrl+Shift+N
2. Tente fazer login novamente
```

#### Solução 4: Atualizar Navegador
- Use versão mais recente do Chrome, Firefox ou Edge
- Evite Internet Explorer (não suportado)

## 🔴 Sistema Muito Lento

### Causas Possíveis

1. **Conexão com internet lenta**
2. **Muitas abas abertas**
3. **Computador sobrecarregado**

### Soluções

#### Solução 1: Verificar Internet
```
Teste sua velocidade:
• Acesse: https://www.speedtest.net/
• Velocidade mínima recomendada: 5 Mbps
```

#### Solução 2: Fechar Outras Abas
- Feche abas não usadas no navegador
- Deixe apenas o SISGEAD aberto

#### Solução 3: Limpar Memória
```
1. Feche programas não essenciais
2. Reinicie o navegador
3. Se persistir, reinicie o computador
```

## 🔴 Não Recebo Notificações

### Para Membros

- O sistema **não envia emails** automaticamente
- Notificações são apenas **dentro do sistema**
- Administrador deve **comunicar manualmente** sobre convites

### Para Administradores

- Envie **link de acesso** por email/WhatsApp manualmente
- Inclua:
  - Link do sistema
  - CPF do usuário
  - Senha temporária: `Sisgead@2024`
  - Instrução para trocar senha

## 📞 Quando Entrar em Contato com Suporte

### Entre em contato se:

- ❌ Nenhuma solução acima funcionou
- ❌ Erro persiste após limpar cache
- ❌ Mensagem de erro não documentada aqui
- ❌ Sistema não carrega há mais de 10 minutos

### Informações para Fornecer

Ao reportar problema, inclua:

1. **Seu CPF** (para localizar sua conta)
2. **Mensagem de erro** exata (tire print)
3. **Navegador usado** (Chrome, Firefox, etc)
4. **O que você estava tentando fazer**
5. **Print do console** (F12 → Console)

## ✅ Checklist de Verificação Rápida

Antes de reportar problema, teste:

- [ ] CPF digitado corretamente (apenas números)
- [ ] Senha correta (maiúsculas/minúsculas)
- [ ] Caps Lock desativado
- [ ] Cache limpo (Ctrl+Shift+Del)
- [ ] Navegador atualizado
- [ ] Testado em modo anônimo
- [ ] Internet funcionando (5+ Mbps)
- [ ] Console sem erros (F12)

Se todos ✅ e problema persiste → Entre em contato com administrador.
