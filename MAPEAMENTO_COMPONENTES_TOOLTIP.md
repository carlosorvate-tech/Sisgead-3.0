# 📍 MAPEAMENTO DE COMPONENTES ALVO - UX AUTOEXPLICATIVO

**Data:** 04 de Novembro de 2025  
**Fase:** Estudo de Componentes Prioritários  
**Objetivo:** Identificar elementos que mais se beneficiam de tooltips  

---

## 🎯 ANÁLISE DE PRIORIDADE POR COMPONENTE

### 🥇 **PRIORIDADE CRÍTICA** - Implementação Imediata

#### **1. AdminDashboard.tsx**
**Elementos-alvo:**
- ✅ **Navegação de Abas** (TabButton)
  - *O quê?* "Aba de [nome da seção]"
  - *Como?* "Clique para acessar [funcionalidade]" 
  - *Por quê?* "Gerencie [aspecto específico] do sistema"
  
- ✅ **Status da IA** (Header superior direito)
  - *O quê?* "Indicador de conexão IA"
  - *Como?* "Mostra status em tempo real"
  - *Por quê?* "Garante funcionalidade das análises"

- ✅ **Botões de Ação** (Backup, Import, Export)
  - *O quê?* "Backup de dados do sistema"
  - *Como?* "Clique para criar cópia de segurança"
  - *Por quê?* "Protege informações contra perda"

**Justificativa:** Portal admin é o coração do sistema, tooltips aqui impactam diretamente a produtividade.

---

#### **2. ResultsScreen.tsx**
**Elementos-alvo:**
- ✅ **Botão "Imprimir Relatório"** (PrintIcon)
  - *O quê?* "Gerar relatório em PDF"
  - *Como?* "Clique para criar documento imprimível"
  - *Por quê?* "Compartilhe ou arquive resultados profissionalmente"

- ✅ **ID do Relatório** (Campo mono)
  - *O quê?* "Código único de identificação"
  - *Como?* "Use para referenciar este relatório"  
  - *Por quê?* "Facilita localização e validação futura"

- ✅ **Botão "Copiar Dados"**
  - *O quê?* "Copiar dados em formato administrativo"
  - *Como?* "Clique para copiar código base64"
  - *Por quê?* "Permite importação no painel admin"

**Justificativa:** Tela mais consultada pelos usuários finais, maior impacto na experiência.

---

#### **3. Questionnaire.tsx**
**Elementos-alvo:**
- ✅ **Botões "MAIS" e "MENOS"** (Seleção de palavras)
  - *O quê?* "Seleção de características comportamentais"
  - *Como?* "Escolha palavra que MAIS se identifica"
  - *Por quê?* "Constrói seu perfil DISC personalizado"

- ✅ **Barra de Progresso**
  - *O quê?* "Andamento do questionário"
  - *Como?* "Mostra questões respondidas de 28 total"
  - *Por quê?* "Acompanhe quanto falta para concluir"

- ✅ **Botão "Ver Resultado"**
  - *O quê?* "Processar respostas e gerar perfil"
  - *Como?* "Disponível após completar 28 questões"
  - *Por quê?* "Revela seu perfil comportamental DISC"

**Justificativa:** Primeira interação significativa, tooltips reduzem abandono.

---

### 🥈 **PRIORIDADE ALTA** - Segunda Fase

#### **4. TeamBuilder.tsx**
**Elementos-alvo:**
- ✅ **Botão "Analisar Equipe Final"**
  - *O quê?* "Análise de complementaridade comportamental"
  - *Como?* "Clique após selecionar membros da equipe"
  - *Por quê?* "Identifica sinergias e potenciais conflitos"

- ✅ **Seleção de Membros** (Checkboxes)
  - *O quê?* "Adicionar colaborador à equipe"
  - *Como?* "Marque checkbox ao lado do nome"
  - *Por quê?* "Compõe equipe para análise comportamental"

- ✅ **Campo "Objetivo do Projeto"**
  - *O quê?* "Descrição do projeto da equipe"
  - *Como?* "Digite objetivo claro e específico"
  - *Por quê?* "IA sugere composição ideal baseada no contexto"

**Justificativa:** Funcionalidade complexa que se beneficia muito de orientação contextual.

---

#### **5. WelcomeScreen.tsx** (Portal Entrevistado)
**Elementos-alvo:**
- ✅ **Campo CPF**
  - *O quê?* "Documento de identificação brasileira"
  - *Como?* "Digite apenas números (formatação automática)"
  - *Por quê?* "Evita duplicação de avaliações"

- ✅ **Botão "Iniciar Avaliação"**
  - *O quê?* "Começar questionário DISC"
  - *Como?* "Ativo após preencher nome e CPF válidos"
  - *Por quê?* "Inicia análise de perfil comportamental (20 min)"

- ✅ **Link "Consulte o guia do usuário"**
  - *O quê?* "Manual de instruções detalhado"
  - *Como?* "Clique para abrir documentação"
  - *Por quê?* "Esclareça dúvidas sobre o processo"

**Justificativa:** Primeira impressão crucial para engajamento do usuário.

---

### 🥉 **PRIORIDADE MÉDIA** - Terceira Fase

#### **6. ProfileExpansionScreen.tsx**
**Elementos-alvo:**
- ✅ **Slider "Nível de Experiência"**
  - *O quê?* "Autoavaliação de expertise profissional"
  - *Como?* "Arraste de 1 (iniciante) a 5 (especialista)"
  - *Por quê?* "Calibra sugestões de papéis da IA"

- ✅ **Botões Metodologias** (Scrum, Kanban, etc.)
  - *O quê?* "Metodologias ágeis com experiência"
  - *Como?* "Clique para alternar seleção"
  - *Por quê?* "Refina análise de fit organizacional"

#### **7. IdentityContextScreen.tsx**
**Elementos-alvo:**
- ✅ **Seleção de Motivadores**
  - *O quê?* "Fatores que te energizam no trabalho"
  - *Como?* "Selecione até 3 motivadores principais"
  - *Por quê?* "Identifica ambientes onde você prospera"

#### **8. AdminLogin.tsx**
**Elementos-alvo:**
- ✅ **Campo Senha**
  - *O quê?* "Autenticação para painel administrativo"
  - *Como?* "Digite senha fornecida pelo administrador"
  - *Por quê?* "Protege dados confidenciais da organização"

---

## 📊 MÉTRICAS DE IMPACTO ESPERADO

### **Por Componente:**
| Componente | Usuários/Dia | Tempo Economizado | Redução Suporte |
|------------|--------------|-------------------|-----------------|
| AdminDashboard | 50-100 | 5 min/sessão | 70% |
| ResultsScreen | 200-300 | 2 min/sessão | 80% |
| Questionnaire | 200-300 | 3 min/sessão | 60% |
| TeamBuilder | 20-50 | 10 min/sessão | 85% |
| WelcomeScreen | 200-300 | 1 min/sessão | 50% |

### **ROI Estimado:**
- **Redução consultas manual:** 75%
- **Tempo de onboarding:** -66% (15min → 5min)
- **Taxa de abandono:** -40%
- **Satisfação usuário:** +35%

---

## 🎨 DESIGN SYSTEM - TOOLTIPS

### **Tipologia por Contexto:**

#### **1. Tooltips Informativos** (Ícones/Botões)
```typescript
interface InformativeTooltip {
  what: "Gerar Relatório DISC";
  how: "Clique para criar documento";
  why: "Compartilhe resultados profissionalmente";
  delay: 300; // ms
  position: "top" | "bottom" | "left" | "right";
}
```

#### **2. Tooltips Explicativos** (Campos/Formulários)
```typescript
interface ExplanatoryTooltip {
  what: "Campo CPF";
  how: "Digite apenas números";
  why: "Evita duplicação de avaliações";
  format: "000.000.000-00"; // exemplo
  validation: boolean;
}
```

#### **3. Tooltips de Status** (Indicadores)
```typescript
interface StatusTooltip {
  what: "Status da IA";
  how: "Atualização em tempo real";
  why: "Confirma funcionalidade das análises";
  status: "connected" | "disconnected" | "testing";
}
```

---

## 🛡️ CRITÉRIOS DE IMPLEMENTAÇÃO

### **Regras de Ouro:**
1. **Princípio da Minimalidade:** Máximo 3 frases por tooltip
2. **Contextualização:** Informação específica para a situação
3. **Acionamento Inteligente:** Delay de 300-500ms para evitar poluição
4. **Posicionamento Dinâmico:** Nunca cobrir conteúdo importante
5. **Acessibilidade:** Suporte completo a teclado e screen readers

### **Testes de Validação:**
- ✅ **Clareza:** Usuário entende sem consultar manual?
- ✅ **Concisão:** Informação essencial em <50 palavras?
- ✅ **Ação:** Tooltip guia para próximo passo lógico?
- ✅ **Valor:** Economiza tempo real do usuário?

---

## 🚀 ROADMAP DE IMPLEMENTAÇÃO

### **Sprint 1 (Prioridade Crítica)**
- [ ] Componente Tooltip universal
- [ ] AdminDashboard tooltips (6 elementos)
- [ ] ResultsScreen tooltips (3 elementos)
- [ ] Questionnaire tooltips (3 elementos)

### **Sprint 2 (Prioridade Alta)**
- [ ] TeamBuilder tooltips (3 elementos)
- [ ] WelcomeScreen tooltips (3 elementos)
- [ ] Microinterações CSS básicas

### **Sprint 3 (Prioridade Média)**
- [ ] ProfileExpansion tooltips
- [ ] IdentityContext tooltips
- [ ] AdminLogin tooltips
- [ ] Refinamentos baseados em feedback

---

**📊 Total Estimado:** 21 tooltips estratégicos  
**🎯 Cobertura:** 85% das dúvidas identificadas  
**⚡ Implementação:** 3 sprints (3 semanas)  

---

**📅 Criado:** 04/11/2025  
**🔄 Status:** ✅ MAPEAMENTO CONCLUÍDO  
**👤 Responsável:** Engenharia UX SISGEAD 2.0