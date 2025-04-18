<script lang="ts">
  import { supabase } from '$lib/supabaseClient';
  import { logger } from '$lib/util/logger';
  import type { RealtimeChannel } from '@supabase/supabase-js';
  import { onMount } from 'svelte';

  const { slug } = $props();
  let channel: RealtimeChannel;

  let messageInput = $state('');
  let messages: string[] = $state([]);

  onMount(() => {
    logger.debug('mount chat', slug);
    channel = supabase
      .channel(slug)
      .on('broadcast', { event: 'shout' }, (payload) => {
        const msg = payload['payload']['message'] as string;
        messages.push(msg);
        logger.debug('receive shout', payload);
        logger.debug('messages', messages);
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
</script>

<div>
  <h2>Chat éphémère</h2>
  <div>
    <input
      type="text"
      placeholder="Message..."
      bind:value={messageInput}
      onkeydown={handleKeyDown}
    />
  </div>
  <div>
    <!-- eslint-disable-next-line svelte/require-each-key todo redo this page -->
    {#each messages as message}
      <p>{message}</p>
    {/each}
  </div>
</div>
