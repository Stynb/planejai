# Aula 18: Criando o Prompt para a IA Generativa

Ao integrar IA em uma aplicação, a qualidade do prompt é determinante para a qualidade da resposta. Veja os elementos essenciais:

## Tabela de Elementos

| Elemento              | Por que é importante                          |
|----------------------|-----------------------------------------------|
| Papel                | Define tom e consistência                     |
| Contexto de exibição | Evita respostas inadequadas para a UI         |
| Dados estruturados   | Garante que a IA usa os valores corretos      |
| Formato de saída     | Permite processar a resposta no código        |
| Schema               | Contrato entre prompt e código                |
| Critérios objetivos  | Elimina ambiguidade em campos enumerados      |
| Regras de restrição  | Previne comportamentos indesejados            |

## Explicação dos Elementos

- **Papel (Role):** Diga quem a IA é. Quanto mais específico, mais consistente e previsível será o comportamento.
- **Contexto de exibição:** A IA não sabe onde a resposta vai aparecer. Se não informar, pode usar markdown, escrever em terceira pessoa ou textos longos demais.
- **Dados estruturados:** Passe os dados de forma clara e rotulada. Inclua também valores calculados para garantir consistência com os que o sistema exibe.
- **Formato de saída:** Em integrações, você precisa processar a resposta no código — instrua a IA a retornar um formato específico (JSON).
- **Schema como contrato:** Mostra exatamente o que o código espera receber da IA.
- **Critérios objetivos:** Para campos com valores fixos, defina os critérios explicitamente. Nunca deixe a IA inferir.
- **Regras de restrição:** Limitam comportamentos indesejados que a IA poderia ter por padrão.
