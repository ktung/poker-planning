<script lang="ts">
  import { REALTIME_LISTEN_TYPES, REALTIME_POSTGRES_CHANGES_LISTEN_EVENT, type RealtimeChannel } from '@supabase/supabase-js';
  import { getMessages, pushMessage } from '$lib/db/messages';
  import { supabase } from '$lib/supabaseClient';
  import { onMount } from 'svelte';

  const { roomId, slug, userId } = $props();
  let chatChannel: RealtimeChannel;

  let messageInput = $state('');

  type Message = {
    message: string;
    created_at: Date;
  };

  let messages: Message[] = $state([]);

  onMount(() => {
    chatChannel = supabase
      .channel(`messages:${slug}`)
      .on(
        REALTIME_LISTEN_TYPES.POSTGRES_CHANGES,
        { event: REALTIME_POSTGRES_CHANGES_LISTEN_EVENT.INSERT, schema: 'public', table: 'messages' },
        (payload) => {
          messages.push({
            message: payload.new.message,
            created_at: new Date(payload.new.created_at)
          });
          setTimeout(scrollToBottom, 0);
        }
      )
      .subscribe();

    (async () => {
      const { data: fetchmessages } = await getMessages(roomId);
      fetchmessages?.forEach((message) => {
        messages.push({
          message: message.message,
          created_at: new Date(message.created_at)
        });
      });
    })();

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

  function formatTime(date: Date): string {
    return new Intl.DateTimeFormat('en-CA', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
    }).format(date);
  }
</script>

<div class="chat-container">
  <div class="messages" bind:this={messagesContainer}>
    {#each messages as message, index (index)}
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
