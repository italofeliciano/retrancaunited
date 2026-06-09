# CHECKPOINT - Retranca United App

## Projeto
App React/Vite do **Retranca United** com Supabase.

Data do checkpoint: 09/06/2026

---

## Funcionalidades Já Implementadas

- Cadastro de jogadores.
- Número da camisa.
- Capitão do time.
- Posição principal e secundária.
- Escalação com várias formações.
- Banco de reservas.
- Agenda.
- Botão **Concluir Evento**.
- Notificações push funcionando.
- Logo/escudo do time no app.
- Ajustes visuais de menu, cabeçalhos e textos.

---

## Notificações Funcionando

O sistema de notificações da Agenda já cobre:

- Novo evento criado.
- Evento editado.
- Evento cancelado.
- Evento concluído sem notificação.
- Lembretes automáticos antes do evento:
  - 60 minutos.
  - 30 minutos.
  - 10 minutos.
  - 5 minutos.
  - 1 minuto.

---

## Edge Functions / Nomes Reais Usados

Estas são as funções usadas no Supabase:

- `send-agenda-notifications`  
  Função dos lembretes automáticos da agenda.

- `send-new-event-notification`  
  Função para notificação imediata quando novo evento é criado.

- `smooth-worker`  
  Função real usada para notificação de evento editado.

- `swift-responder`  
  Função real usada para notificação de evento cancelado.

---

## Supabase

Project ref:

```txt
xryxtzhbthpuulrcbeqv
```

URL base:

```txt
https://xryxtzhbthpuulrcbeqv.supabase.co
```

---

## Secrets Importantes

Secrets usados nas Edge Functions:

- `VAPID_PUBLIC_KEY`
- `VAPID_PRIVATE_KEY`
- `VAPID_SUBJECT`
- `EVENT_TIMEZONE_OFFSET`
- `CRON_SECRET`

Valor usado em testes para `CRON_SECRET`:

```txt
retranca-united-cron-2026
```

---

## Banco / Tabelas Importantes

Tabelas usadas no projeto:

- `players`
- `team_state`
- `events`
- `notification_subscriptions`
- `agenda_notification_logs`
- `user_profiles` — criada durante tentativa de login com Supabase Auth, mas será abandonada no app.

Campos adicionados em `players`:

- `shirt_number`
- `is_captain`
- `preferred_position`
- `secondary_position`

---

## Triggers Importantes

Triggers usados em `events`:

- `trigger_notify_new_event`  
  Dispara notificação ao criar evento.

- `trigger_notify_event_updated`  
  Dispara notificação ao editar evento.  
  Deve chamar `smooth-worker`.

- `trigger_notify_event_canceled`  
  Dispara notificação ao cancelar evento.  
  Deve chamar `swift-responder`.

- `set_events_updated_at`  
  Atualiza campo de controle de data/hora.

---

## Decisão Atual Sobre Login

O login com **Supabase Auth** será abandonado por enquanto.

Motivo:

- Ficou complexo demais para a necessidade atual.
- A ideia agora é ter um login simples, próprio do app.
- Não usar email obrigatório.
- Não usar confirmação de email.
- Não usar senha escondida no Supabase Auth.

---

## Login Simples Desejado

Criar tabela futura:

```txt
app_users
```

Campos planejados:

```txt
id
username
password_text
name
is_admin
player_id
active
created_at
updated_at
```

Fluxo desejado:

```txt
Usuário digita nome.sobrenome
Usuário digita senha
App consulta app_users
Se username e password_text baterem, entra
Se is_admin = true, libera admin
Se is_admin = false, entra como jogador
```

Exemplo de login:

```txt
Usuário: italo.feliciano
Senha: senha escolhida
```

---

## Próximo Passo Técnico

Limpar do `App.jsx` todo o login criado com Supabase Auth:

- `session`
- `authUser`
- `userProfile`
- `loginEmail`
- `loginPassword`
- `authLoading`
- `loginLoading`
- `dataLoadedForUser`
- `initializeAuth`
- `loadUserProfile`
- `signIn` antigo
- `signOut` antigo
- tela de login Auth
- bloqueios baseados em `userProfile`
- lógica de `isAdmin()` baseada em Supabase Auth

Depois criar login simples com:

- `currentUser`
- `loginUsername`
- `loginPassword`
- `app_users`
- `localStorage`
- `isAdmin()` baseado em `currentUser.is_admin`

---

## Estado Atual Antes Da Limpeza

O app teve login com Supabase Auth adicionado, mas isso causou problemas de sincronização e permissões.

Foi decidido voltar para um login simples.

Atenção: antes de clicar em **Salvar** no app, confirmar se os jogadores reais carregaram. Não salvar se aparecerem jogadores padrão como:

```txt
Goleiro
Lateral Dir.
Zagueiro
Volante
Meia
Ponta Dir.
Centroavante
```

---

## Regras Desejadas Para Usuários No Futuro

### Administrador

Pode:

- Cadastrar jogadores.
- Editar jogadores.
- Alterar escalação.
- Criar eventos.
- Editar eventos.
- Cancelar eventos.
- Concluir eventos.
- Cadastrar usuários.

### Jogador

Pode:

- Ver agenda.
- Ver escalação.
- Ativar notificações.
- Confirmar presença em eventos, futuramente.

---

## Próximas Funcionalidades Planejadas

Depois do login simples:

1. Tela de usuários só para administrador.
2. Cadastro de usuário com:
   - nome;
   - usuário `nome.sobrenome`;
   - senha;
   - administrador sim/não;
   - jogador vinculado.
3. Confirmação de presença em eventos:
   - Vou;
   - Não vou;
   - Talvez.
4. Lista de presença por evento:
   - Confirmados;
   - Não vão;
   - Talvez;
   - Sem resposta.
5. Lista separada por status de evento:
   - Próximos;
   - Concluídos;
   - Cancelados.

---

## Observação De Segurança

O login simples com senha em texto é mais fácil de implementar, mas não é o modelo mais seguro.

Para o objetivo atual do app interno do time, foi aceito seguir com essa solução simples.

No futuro, pode ser melhor trocar `password_text` por hash de senha.

---

## Como Retomar O Projeto Em Nova Conversa

Se esta conversa se perder, enviar este arquivo `CHECKPOINT-RETRANCA-UNITED.md` e pedir:

```txt
Continue o projeto Retranca United a partir deste checkpoint.
O próximo passo é limpar o login Supabase Auth do App.jsx e criar login simples com app_users.
```
