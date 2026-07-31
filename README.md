# MVP — Avaliação de Riscos Psicossociais (NR-1)

Site estático puro (HTML/CSS/JS, sem build, sem backend, sem banco de dados).
2 páginas: `index.html` (admin) e `questionnaire.html` (respondente).

## Estrutura

```
index.html            → Tela 1: gera o link
questionnaire.html    → Tela 2: aplica o questionário
app-admin.js          → lógica da Tela 1
app-questionnaire.js  → lógica da Tela 2 + envio das respostas
styles.css            → design compartilhado
data/copsoq3.json     → questionário COPSOQ III (PLACEHOLDER)
data/hse.json         → questionário HSE Indicator Tool (PLACEHOLDER)
```

## 1. Trocar as perguntas placeholder pelo instrumento oficial

Os JSONs em `data/` têm perguntas de exemplo só para validar o formato.
Troque `questions` pelo conteúdo licenciado que vocês já usam, mantendo
o mesmo formato:

```json
{
  "id": "copsoq3",
  "title": "COPSOQ III",
  "scales": {
    "frequencia": [
      { "value": 1, "label": "Nunca" },
      { "value": 5, "label": "Sempre" }
    ]
  },
  "questions": [
    { "id": "copsoq_01", "text": "Texto da pergunta", "scaleId": "frequencia" }
  ]
}
```

Para adicionar um terceiro questionário, basta criar `data/novo.json` no
mesmo formato — o admin já lista as opções fixas no `<select>` de
`index.html`, então adicione a nova `<option value="novo">` lá também.

## 2. Configurar o envio das respostas (Google Forms)

Abra `app-questionnaire.js` e preencha o bloco no topo do arquivo:

1. Crie um Google Form com 3 perguntas de **texto curto/parágrafo**:
   empresa, questionário, respostas.
2. Publique o formulário, clique nos `⋮` → **"Obter link pré-preenchido"**,
   preencha qualquer valor de teste e gere o link.
3. O link gerado expõe os IDs de cada campo, no formato
   `entry.123456789`. Copie-os.
4. Pegue o `FORM_ID` da própria URL do formulário
   (`.../forms/d/e/FORM_ID/formResponse`).
5. Preencha as constantes `GOOGLE_FORM_ID` e `GOOGLE_FORM_ENTRIES` no
   topo de `app-questionnaire.js`.

Sem essa configuração, as respostas ainda funcionam ponta a ponta —
elas só ficam no console do navegador (`console.log`), o que é útil
para testar o fluxo antes de plugar o envio real.

**Alternativa mais simples que Google Forms:** um serviço como
[Formspree](https://formspree.io) ou [Getform](https://getform.io)
aceita `fetch` com `mode: "cors"` de verdade (você recebe confirmação
de sucesso, sem o truque do `no-cors`) e não exige mapear `entry.IDs`.
Se preferir, troque o bloco `submitResponses()` por um `fetch` comum
para o endpoint deles.

## 3. Colocar em produção

Como é um site 100% estático, qualquer um destes serve, de graça:

- **Vercel**: `vercel deploy` na pasta, ou arraste a pasta em vercel.com.
- **Netlify**: arraste a pasta em app.netlify.com/drop.
- **GitHub Pages**: suba os arquivos num repo e ative Pages nas configurações.

Não precisa de build step — são arquivos estáticos servidos como estão.

## 4. Fluxo de uso

1. Consultor abre `/index.html`, preenche a empresa, escolhe o
   questionário, clica em **Gerar link**.
2. Copia o link (`/questionnaire.html?company=EmpresaABC&questionnaire=copsoq3`)
   e envia por WhatsApp/e-mail para os funcionários.
3. Cada funcionário abre o link no celular ou computador, responde
   uma pergunta por vez, e ao final clica em **Enviar**.

## O que este MVP deliberadamente não tem

Autenticação, painel administrativo, banco de dados, dashboard de
resultados — por design, para validar a proposta de valor rápido.
O próximo passo natural, se validar, é puxar as respostas do Google
Sheets (conectado ao Form) para gerar os primeiros relatórios, antes
de partir para a arquitetura completa em Kotlin/Ktor que você já
vinha desenhando.
