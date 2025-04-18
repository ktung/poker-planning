<script lang="ts">
  import { supabase } from '$lib/supabaseClient';
  import { onMount } from 'svelte';

  const { slug } = $props();

  let messageInput = $state('');
  let messages: string[] = $state([]);

  onMount(() => {
    const channel = supabase
      .channel(slug)
      .on('broadcast', { event: 'shout' }, (payload) => {
        const msg = payload['payload']['message'] as string;
        messages.push(msg);
      })
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  });

  const sendMessage = () => {
    supabase.channel(slug).send({
      type: 'broadcast',
      event: 'shout',
      payload: { message: messageInput }
    });

    messageInput = '';
  };
</script>

<div>
  <h2>Chat éphémère</h2>
  <div>
    <input type="text" placeholder="Message..." bind:value={messageInput} />
    <button onclick={sendMessage}>Send</button>
  </div>
  <div>
    <!-- eslint-disable-next-line svelte/require-each-key todo redo this page -->
    {#each messages as message}
      <p>{message}</p>
    {/each}
  </div>
</div>
