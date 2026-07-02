# Roleta da Turma

Aplicação web completa para professores sortearem estudantes por número ou por nome. Funciona sem backend, salva tudo no próprio navegador com LocalStorage e é configurada como PWA para uso offline depois de carregada.

## Recursos

- Criação, edição, duplicação e exclusão de múltiplas roletas.
- Roletas por números, com intervalo inicial/final e números ignorados.
- Roletas por nomes, com entrada manual, colagem em massa, importação `.txt`/`.csv`, edição, remoção de duplicados e reordenação.
- Roleta circular SVG animada com ponteiro, desaceleração, destaque do resultado e sorteio sequencial de múltiplos participantes.
- Opção “Não repetir participantes já sorteados”, reinício com confirmação e desfazer último sorteio.
- Histórico com cópia, exportação `.txt`/`.csv` e limpeza.
- Modo tela cheia para projeção em sala e tecla Espaço para girar.
- Configurações de sons, confetes, velocidade, duração, tema, nomes na roleta, confirmação e vibração.
- Importação/exportação de roleta em JSON, backup/restauração geral e exportação de participantes.
- PWA com manifesto, ícones e service worker.

## Instalação

```bash
npm install
```

## Desenvolvimento

```bash
npm run dev
```

Depois, abra a URL mostrada pelo Vite no navegador.

## Build de produção

```bash
npm run build
```

Os arquivos finais serão gerados em `dist/`.

## Prévia da versão final

```bash
npm run preview
```

## Publicação gratuita

### GitHub Pages

1. Gere o build com `npm run build`.
2. Publique a pasta `dist/` usando uma Action de GitHub Pages ou uma branch de deploy.
3. Se publicar em um subcaminho, ajuste `base` no `vite.config.ts`.

### Netlify

1. Crie um site novo e conecte o repositório.
2. Use `npm run build` como comando de build.
3. Use `dist` como diretório de publicação.

### Vercel

1. Importe o repositório na Vercel.
2. Framework: Vite.
3. Build command: `npm run build`.
4. Output directory: `dist`.

## Observações

O sorteio usa `crypto.getRandomValues()` quando disponível. O resultado calculado define o ângulo final da roleta, para que o ponteiro pare no mesmo participante exibido no resultado.
