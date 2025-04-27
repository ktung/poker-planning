<script lang="ts">
  import { REALTIME_LISTEN_TYPES, REALTIME_POSTGRES_CHANGES_LISTEN_EVENT, type RealtimeChannel } from '@supabase/supabase-js';
  import { getMessages, pushMessage } from '$lib/db/messages';
  import { supabase } from '$lib/supabaseClient';
  import { formatTime } from '$lib/util/date';
  import { onMount } from 'svelte';

  interface Props {
    roomId: string;
    slug: string;
    userId: string;
  }
  interface Message {
    id: string;
    message: string;
    createdAt: Date;
  }

  const { roomId, slug, userId }: Props = $props();
  let messageInput = $state('');
  let messages: Message[] = $state([]);
  let chatChannel: RealtimeChannel;

  onMount(() => {
    getMessages(roomId)
      .then(({ data: messagesDb }) => {
        messagesDb?.forEach((msg) => {
          messages.push({
            id: msg.id,
            message: msg.message,
            createdAt: new Date(msg.created_at)
          });
        });
        setTimeout(scrollToBottom, 0);
      })
      .then(() => {
        chatChannel = supabase
          .channel(`messages:${slug}`)
          .on(
            REALTIME_LISTEN_TYPES.POSTGRES_CHANGES,
            { event: REALTIME_POSTGRES_CHANGES_LISTEN_EVENT.INSERT, schema: 'public', table: 'messages' },
            (payload) => {
              if (messages.some((msg) => msg.id === payload.new.id)) {
                return;
              }
              messages.push({
                id: payload.new.id,
                message: payload.new.message,
                createdAt: new Date(payload.new.created_at)
              });
              setTimeout(scrollToBottom, 0);
            }
          )
          .subscribe();
      });

    return () => {
      chatChannel.unsubscribe();
    };
  });

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Enter' && messageInput.trim() !== '') {
      pushMessage(roomId, userId, messageInput).then();
      messageInput = '';
    }
  };

  let messagesContainer: HTMLDivElement;
  function scrollToBottom() {
    if (messagesContainer) {
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
  }
</script>

<div class="chat-container">
  <div class="messages" bind:this={messagesContainer}>
    {#each messages as message (message.id)}
      <div class="message">{message.message} - {formatTime(message.created_at)}</div>
    {/each}
  </div>

  <div class="input-container">
    <input class="message-input" type="text" placeholder="Message..." bind:value={messageInput} onkeydown={handleKeyDown} />
  </div>
</div>

<style>
  .chat-container {
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 4px var(--shadow);
    max-width: 400px;
    margin: 1rem 0;
  }

  .messages {
    height: 15vh;
    overflow-y: auto;
    padding: 1rem;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .message {
    background: #f0f2f5;
    padding: 0.5rem 1rem;
    border-radius: 1rem;
    max-width: 80%;
    word-break: break-word;
    line-height: 1.4;
  }

  .input-container {
    padding: 1rem;
    border-top: 1px solid #eaeaea;
  }

  .message-input {
    box-sizing: border-box;
    width: 100%;
    padding: 0.8rem;
    border: 2px solid #eaeaea;
    border-radius: 20px;
    font-size: 0.9rem;
    transition: border-color 0.2s ease;
  }

  .message-input:focus {
    outline: none;
    border-color: var(--primary-color-focus);
  }

  @media (max-width: 480px) {
    .chat-container {
      margin: 0.5rem 0;
      max-width: 100%;
    }

    .messages {
      height: 15vh;
    }
  }
</style>
