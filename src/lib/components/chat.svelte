<script lang="ts">
  import { supabase } from '$lib/supabaseClient';
  import { REALTIME_LISTEN_TYPES, type RealtimeChannel } from '@supabase/supabase-js';
  import { onMount } from 'svelte';

  const { slug } = $props();
  let channel: RealtimeChannel;

  let messageInput = $state('');
  let messages: string[] = $state([]);

  onMount(() => {
    channel = supabase
      .channel(slug)
      .on(REALTIME_LISTEN_TYPES.BROADCAST, { event: 'shout' }, (payload) => {
        const msg = payload['payload']['message'] as string;
        messages.push(msg);
        setTimeout(scrollToBottom, 0);
      })
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  });

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Enter' && messageInput.trim() !== '') {
      sendMessage();
      messageInput = '';
    }
  };

  const sendMessage = () => {
    supabase.channel(slug).send({
      type: 'broadcast',
      event: 'shout',
      payload: { message: messageInput }
    });
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
    {#each messages as message, index (index)}
      <div class="message">{message}</div>
    {/each}
  </div>

  <div class="input-container">
    <input
      class="message-input"
      type="text"
      placeholder="Message..."
      bind:value={messageInput}
      onkeydown={handleKeyDown}
    />
  </div>
</div>

<style>
  .chat-container {
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
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
    border-color: #007bff;
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
