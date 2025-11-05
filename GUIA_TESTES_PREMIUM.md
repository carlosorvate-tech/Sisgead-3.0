# 🧪 GUIA DE TESTES - SISGEAD PREMIUM 3.0

**Data:** 5 de novembro de 2025  
**Versão:** 3.0-alpha  
**Status:** ✅ Pronto para testes externos

---

## 🚀 COMO INICIAR OS TESTES

### 1. Iniciar o Servidor de Desenvolvimento

```powershell
# No diretório c:\w\sisgead-3.0
npm run dev
```

O servidor iniciará em: **http://localhost:5173**

---

## 📋 FLUXO DE TESTE COMPLETO

### TESTE 1: Primeiro Acesso - Setup Premium

1. **Acesse**: http://localhost:5173
2. **Esperado**: Modal de seleção de versão aparece
3. **Ação**: Clique em "Configurar Premium 3.0"

#### Etapa 1: Criar Usuário Master
- **Preencha**:
  - Nome: `João Silva`
  - CPF: `123.456.789-00`
  - Email: `joao@teste.com`
  - Telefone: (opcional)
  - Senha: `senha1234`
  - Confirmar Senha: `senha1234`
- **Validações testadas**:
  - ✅ CPF com 11 dígitos
  - ✅ Email válido
  - ✅ Senha com mínimo 8 caracteres
  - ✅ Senhas coincidem
- **Clique**: "Próximo →"

#### Etapa 2: Configurar Instituição
- **Preencha**:
  - Nome: `Secretaria Municipal de Educação`
  - CNPJ: `12.345.678/0001-90`
  - Tipo: `Órgão Público`
  - Email: `contato@educacao.sp.gov.br`
  - Telefone: (opcional)
  - Descrição: (opcional)
- **Validações testadas**:
  - ✅ CNPJ com 14 dígitos
  - ✅ Email de contato válido
- **Clique**: "Próximo →"

#### Etapa 3: Criar Organizações (Opcional)
- **Opção A - Adicionar organizações**:
  - Digite: `Diretoria de Ensino Fundamental`
  - Clique: "+ Adicionar"
  - Digite: `Diretoria de Ensino Médio`
  - Clique: "+ Adicionar"
  - **Clique**: "Próximo →"
  
- **Opção B - Pular**:
  - **Clique**: "Pular esta etapa"

#### Etapa 4: Adicionar Usuários (Opcional)
- **Opção A - Adicionar usuários**:
  - Nome: `Maria Santos`
  - Email: `maria@educacao.sp.gov.br`
  - CPF: `987.654.321-00`
  - Função: `Admin Organizacional`
  - Organizações: (selecione se criou)
  - Clique: "+ Adicionar Usuário"
  - **Clique**: "Concluir Configuração →"
  
- **Opção B - Pular**:
  - **Clique**: "Pular esta etapa"

#### Tela de Conclusão
- **Verifica**:
  - ✅ Mensagem de sucesso
  - ✅ Resumo da configuração
  - ✅ Lista de organizações criadas
  - ✅ Lista de usuários adicionados
- **Clique**: "Ir para o Dashboard →"

---

### TESTE 2: Dashboard Premium

#### Verificações no Dashboard
- **Header**:
  - ✅ Nome da instituição aparece
  - ✅ Nome do usuário logado aparece
  - ✅ Role do usuário (👑 Master)
  - ✅ Botão "Sair" funcional

- **Cards de Estatísticas**:
  - ✅ Contador de organizações
  - ✅ Contador de usuários
  - ✅ Papel do usuário atual

- **Lista de Organizações** (se criou):
  - ✅ Nome da organização
  - ✅ Ícone visual
  - ✅ Status (Ativa)

- **Lista de Usuários**:
  - ✅ Nome e email
  - ✅ Role (Master, Admin, etc)
  - ✅ Status (Ativo/Inativo)

- **Ações Rápidas**:
  - ✅ Botão "Voltar para Standard 2.0"
  - ✅ Botão "🔄 Recarregar Dados"

---

### TESTE 3: Trocar para Standard 2.0

1. **No Dashboard Premium**:
   - Clique: "← Voltar para Standard 2.0"
2. **Esperado**:
   - ✅ Página recarrega
   - ✅ Volta para interface Standard 2.0
3. **Dados persistem**:
   - ✅ Dados do Premium salvos no localStorage
   - ✅ Dados do Standard salvos no IndexedDB

---

### TESTE 4: Voltar para Premium

1. **Na interface Standard 2.0**:
   - Recarregue a página
2. **Esperado**:
   - ✅ Como já configurou Premium, deve aparecer login ou dashboard
   - ✅ Não pede configuração novamente

---

## 🔍 VERIFICAÇÕES TÉCNICAS

### LocalStorage Keys
Abra DevTools (F12) → Application → Local Storage:

```
Deve conter:
✅ premium-institutions
✅ premium-organizations  
✅ premium-users
✅ sisgead-premium-session
✅ sisgead-version (valor: "premium")
```

### Console do Navegador
- ❌ **NÃO** deve ter erros críticos
- ⚠️ Warnings de React são normais (types em desenvolvimento)

---

## 🐛 PROBLEMAS CONHECIDOS (Esperados)

### Avisos TypeScript (Normais)
```
⚠️ "Não é possível localizar o módulo 'react'"
→ Falso positivo: React carrega em runtime
→ Não afeta funcionamento
```

### Funcionalidades Pendentes
- ⏳ Edição de organizações no dashboard
- ⏳ Edição de usuários no dashboard
- ⏳ Relatórios consolidados
- ⏳ Sistema de auditoria visual
- ⏳ Gráficos e analytics

---

## ✅ CHECKLIST DE TESTE

### Fluxo Básico
- [ ] Modal de seleção aparece
- [ ] Pode escolher Premium
- [ ] Wizard completa 4 etapas
- [ ] Dashboard carrega corretamente
- [ ] Dados persistem após reload

### Validações
- [ ] CPF inválido é rejeitado
- [ ] Email inválido é rejeitado
- [ ] Senha curta é rejeitada
- [ ] Senhas diferentes são rejeitadas
- [ ] CNPJ inválido é rejeitado

### Navegação
- [ ] Pode voltar entre etapas do wizard
- [ ] Pode cancelar setup
- [ ] Pode trocar entre Standard e Premium
- [ ] Logout funciona
- [ ] Reload preserva estado

### Dados
- [ ] Organizações aparecem na lista
- [ ] Usuários aparecem na lista
- [ ] Estatísticas estão corretas
- [ ] LocalStorage tem as keys corretas

---

## 📊 DADOS DE TESTE SUGERIDOS

### Instituição 1: Educação Pública
```yaml
Nome: Secretaria Municipal de Educação
CNPJ: 12.345.678/0001-90
Tipo: Órgão Público
Email: contato@educacao.sp.gov.br

Organizações:
  - Diretoria de Ensino Fundamental
  - Diretoria de Ensino Médio
  - Diretoria de Educação Infantil

Usuários:
  - Master: João Silva (joao@teste.com)
  - Admin: Maria Santos (maria@teste.com)
  - Usuário: Pedro Oliveira (pedro@teste.com)
```

### Instituição 2: Empresa Privada
```yaml
Nome: Tech Solutions LTDA
CNPJ: 98.765.432/0001-10
Tipo: Empresa Privada
Email: rh@techsolutions.com

Organizações:
  - Departamento de TI
  - Departamento de RH
  - Departamento Financeiro
```

---

## 🚨 REPORTAR PROBLEMAS

### Se encontrar bugs:
1. **Tire screenshot** do erro
2. **Copie** mensagem do console (F12)
3. **Descreva** os passos para reproduzir
4. **Informe** navegador e versão

### Informações úteis:
- Navegador usado: _______________
- Sistema Operacional: _______________
- Dados de teste usados: _______________

---

## 📞 SUPORTE

Em caso de dúvidas durante os testes:
- Verifique o console do navegador (F12)
- Verifique o localStorage (DevTools → Application)
- Limpe o localStorage se quiser recomeçar:
  ```javascript
  // No console do navegador:
  localStorage.clear();
  location.reload();
  ```

---

## ✨ PRÓXIMAS FUNCIONALIDADES

Após validação dos testes:
- 📊 Dashboards completos (Institucional, Organizacional, Usuário)
- ⚙️ Gestão de organizações e usuários
- 📈 Relatórios e analytics
- 🔍 Sistema de auditoria completo
- 🌳 Visualização hierárquica de organizações
- 📄 Exportação de dados
- 🔐 Sistema de permissões granulares

---

**Bons testes! 🚀**
