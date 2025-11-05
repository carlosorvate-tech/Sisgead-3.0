# 🚀 SISGEAD: Sistema de Gestão de Equipes de Alto Desempenho

![Versão](https://img.shields.io/badge/Versão-1.1-blue.svg)
![Status do Projeto](https://img.shields.io/badge/Status-Ativo-brightgreen.svg)
![Licença](https://img.shields.io/badge/Licença-MIT-green.svg) <!-- (Sugestão de licença, ajuste conforme sua escolha) -->

---

## ✨ Reinvente sua gestão de equipes: Propósito, Potencial e Performance!

O **SISGEAD** (Sistema de Gestão de Equipes de Alto Desempenho) é mais do que uma ferramenta; é uma **Tecnologia Assistiva Cognitiva** projetada para revolucionar a forma como gestores de P&D+I constroem, gerenciam e otimizam suas equipes. Desenvolvido para transformar dados brutos em insights acionáveis, o SISGEAD mitiga vieses inconscientes e amplifica a capacidade estratégica do gestor na complexa arte da engenharia de equipes.

Inspirado na metodologia **Ikigai**, acreditamos que a tecnologia deve ser um catalisador para o crescimento e a conexão humana. O SISGEAD une **propósito, paixão, vocação e profissão** ao combinar o renomado diagnóstico comportamental DISC com perfis técnicos e metodológicos, oferecendo uma visão 360° dos colaboradores. Prepare-se para explorar ideias audaciosas e construir um futuro digital mais humano, eficiente e significativo!

---

##    Por que o SISGEAD? A solução para desafios complexos

A formação de equipes de alto desempenho é um desafio constante. A alocação de talentos baseada apenas em competências técnicas, muitas vezes ignora as dinâmicas comportamentais cruciais para a sinergia, comunicação e resolução de conflitos.

**O SISGEAD resolve isso ao:**
*   **Fornecer uma visão 360°:** Integra DISC, perfis técnicos e metodológicos para uma análise completa de cada colaborador.
*   **Otimizar a tomada de decisão:** Oferece dados robustos e análises inteligentes para a formação de equipes.
*   **Reduzir a carga cognitiva:** Organiza dados complexos e atua como um "andaime" estruturado para decisões estratégicas.
*   **Garantir privacidade e segurança:** Uma arquitetura *serverless* e 100% *client-side* assegura que seus dados permaneçam sempre sob seu controle, localmente.

---

## 💡 Funcionalidades que impulsionam seus resultados

O SISGEAD é dividido em duas interfaces principais: o portal do Entrevistado para autoavaliação e o poderoso Painel de Controle Administrativo.

### Para o entrevistado (colaborador)
*   **Diagnóstico DISC simplificado:** Processo rápido e intuitivo para autoavaliação comportamental.
*   **Resultados detalhados:** Perfil DISC primário e secundário com gráficos e descrições ricas.
*   **Expansão de perfil (Opcional):** Adicione competências técnicas, metodológicas e contexto de trabalho para análises ainda mais ricas.
*   **Confidencialidade total:** Seus dados são privados e compartilhados apenas com o gestor através de uma "String de Dados" segura.

### Para o administrador (Gestor)
O Painel de controle administrativo oferece um hub completo para a gestão de talentos:

1.  **Registro de avaliações:**
    *   **Importação segura:** Adicione registros de colaboradores manualmente via "String de Dados" codificada e anexe PDFs para auditoria.
    *   **Gerenciamento de armazenamento:** Escolha entre o modo padrão (IndexedDB) ou o **RECOMENDADO** modo "Pasta Local" para máxima segurança e controle dos seus dados.
    *   **Backup e restauração:** Exporte e importe backups completos de todos os dados da aplicação.
2.  **Relatório da equipe:**
    *   Análise visual da distribuição dos perfis DISC da sua equipe para entender sua composição comportamental.
3.  **Construtor de equipes inteligente:**
    *   **Definição de projeto:** Nomeie e descreva o objetivo da equipe.
    *   **Sugestão da IA (atualmente: Google Gemini):** A IA analisa perfis disponíveis e sugere equipes ideais com justificativas detalhadas.
    *   **Ajuste fino:** Revise, adicione/remova membros e interaja com o assistente de IA para refinamentos.
    *   **Análise de complementaridade:** A IA gera análises de sinergias e pontos de atenção.
    *   **Geração de propostas:** Salve a equipe e receba automaticamente uma "Proposta de Escala de Pessoas e Funções".
4.  **Portfólio de equipes:**
    *   Gerencie todas as equipes criadas, visualize membros e objetivos.
    *   Identifique colaboradores em múltiplas equipes e otimize alocações.
    *   Assistente de IA para perguntas estratégicas sobre todo o seu portfólio.
5.  **Propostas geradas:**
    *   Um "silo de conhecimento" onde você acessa todas as propostas formais e interações com a IA, que alimentam futuras sugestões.

---

## 🛡️ Privacidade e segurança no core do SISGEAD

Acreditamos que a tecnologia deve empoderar, não comprometer. O SISGEAD foi projetado com **Privacy-by-Design** como um pilar fundamental:

*   **100% Client-Side / Serverless:** Seus dados nunca saem do seu computador ou navegador. Toda a lógica e persistência de dados ocorrem localmente.
*   **Persistência robusta:**
    *   **Padrão:** `IndexedDB` para alta capacidade e desempenho.
    *   **Recomendado:** `File System Access API` para salvar seus dados em um arquivo `sisgead-database.json` em uma pasta local de sua escolha, garantindo total visibilidade, controle e facilidade de backup.
*   **Integridade de dados:** Utiliza hash SHA-256 para verificar a autenticidade dos dados importados.
*   **Prevenção XSS:** Sanificação robusta de entrada de usuário para prevenir ataques.

---

## 🛠️ Arquitetura e tecnologias: Solidez para Inovação

O SISGEAD é uma Aplicação de Página Única (SPA) construída com um stack tecnológico moderno e eficiente:

*   **Frontend:** `React` com `TypeScript` para uma base de código robusta e escalável.
*   **Estilização:** `Tailwind CSS` para desenvolvimento rápido e consistente da UI.
*   **Visualização de Dados:** `Recharts` para gráficos interativos e claros.
*   **Inteligência Artificial:** `API do Google Gemini` para sugestões estratégicas e processamento de linguagem natural.
*   **Roteamento:** `React Router` para uma navegação fluida na SPA.
*   **Ambiente de Desenvolvimento:** `Vite` para uma experiência de desenvolvimento rápida e otimizada.

---

## 🚀 Como começar (Quick Start)

### Para administradores:
1.  **Acesse a aplicação:** O SISGEAD funciona diretamente no seu navegador. Atualmente, você pode acessá-lo em: [https://sisgead-431935293376.us-west1.run.app](https://sisgead-431935293376.us-west1.run.app) (link para beta-teste, ajuste se for um link de deploy estável).
2.  **Acesso administrativo:** Na página inicial, clique em "Acesso Administrativo".
3.  **Configurar armazenamento (Altamente Recomendado!):**
    *   Vá para a aba "Registros de Avaliação" > "Gerenciamento de Armazenamento".
    *   Clique em "**Conectar a uma Pasta Local**" para selecionar uma pasta no seu computador. Isso garante que seus dados, o ativo mais valioso, estejam sempre seguros e acessíveis para você em um arquivo `sisgead-database.json`.
4.  **Importar registros:** Cole as "Strings de Dados" recebidas dos colaboradores e anexe os PDFs para auditoria.

### Para colaboradores (entrevistados):
1.  **Inicie sua Avaliação:** Você receberá um link do seu gestor para iniciar a autoavaliação.
2.  **Preencha os Dados:** Insira seu nome completo, CPF e responda ao questionário DISC.
3.  **Compartilhe seus Dados:** Ao final, clique em "**Copiar Dados para o Admin**" e **ENVIE a String de Dados** gerada para o seu gestor. Opcionalmente, você pode imprimir/salvar o PDF do seu relatório.

---

## 🤝 Contribuição e colaboração

Acreditamos na força da comunidade e na união de esforços. Sua visão, sugestões e contribuições são muito bem-vindas para o aprimoramento do SISGEAD!

*   **Relate Bugs e Sugira Melhorias:** Utilize a seção [Issues](https://github.com/Orvate/sisgead/issues) para nos ajudar a identificar e corrigir problemas, ou para propor novas funcionalidades.
*   **Contribua com Código:** Se você é desenvolvedor e deseja contribuir com o código, por favor, leia nossas [Diretrizes de Contribuição](CONTRIBUTING.md) (se existir) ou abra uma [Pull Request](https://github.com/Orvate/sisgead/pulls).
*   **Discussões:** Participe das [Discussões](https://github.com/Orvate/sisgead/discussions) para compartilhar ideias, fazer perguntas e colaborar com a comunidade.

---

## 🛣️ Roadmap (Opcional - mas super recomendado!)

Estamos constantemente buscando inovar e expandir as capacidades do SISGEAD. Algumas ideias e planos futuros incluem:
*   [Mencionar 1-2 funcionalidades planejadas para a próxima versão]
*   [Explorar novas integrações ou aprimoramentos na IA]
*   [Expandir opções de relatórios e dashboards]

Se você tem uma ideia audaciosa, compartilhe conosco!

---

## 📄 Licença

Este projeto está licenciado sob a Licença MIT - veja o arquivo [LICENSE](LICENSE) para mais detalhes.

---

## 💖 Autores e Agradecimentos

*   **Orvate, Carlos A:** Idealização, análise, arquitetura, curadoria e desenvolvimento principal.

Um agradecimento especial a todos que de alguma forma contribuíram para tornar o SISGEAD uma realidade. Acreditamos no potencial individual e coletivo para construir soluções de impacto real!

---