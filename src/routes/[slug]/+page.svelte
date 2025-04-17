<script lang="ts">
  import { supabase } from '$lib/supabaseClient';
  import { onDestroy } from 'svelte';
  import type { PageData } from './$types';

  const { data }: { data: PageData } = $props();
  const { slug } = data;

  let messageInput = $state('');
  let messages: string[] = $state([]);

  const tableData = [
    {
      pointValue: 0,
      complexity: 'easy',
      effort: '< 2h',
      uncertainty: 'no unknows'
    },
    {
      pointValue: 0.5,
      complexity: 'easy',
      effort: '2h-4h',
      uncertainty: 'no unknows'
    },
    {
      pointValue: 1,
      complexity: 'easy',
      effort: '2h-4h',
      uncertainty: 'no unknows'
    },
    {
      pointValue: 2,
      complexity: 'easy',
      effort: '2h-4h',
      uncertainty: 'no unknows'
    },
    {
      pointValue: 3,
      complexity: 'easy',
      effort: '2h-4h',
      uncertainty: 'no unknows'
    },
    {
      pointValue: 5,
      complexity: 'easy',
      effort: '2h-4h',
      uncertainty: 'no unknows'
    },
    {
      pointValue: 8,
      complexity: 'easy',
      effort: '2h-4h',
      uncertainty: 'no unknows'
    },
    {
      pointValue: 13,
      complexity: 'easy',
      effort: '2h-4h',
      uncertainty: 'no unknows'
    },
    {
      pointValue: 20,
      complexity: 'easy',
      effort: '2h-4h',
      uncertainty: 'no unknows'
    },
    {
      pointValue: 40,
      complexity: 'easy',
      effort: '2h-4h',
      uncertainty: 'no unknows'
    },
    {
      pointValue: 100,
      complexity: 'easy',
      effort: '2h-4h',
      uncertainty: 'no unknows'
    }
  ];

  supabase
    .channel(slug)
    .on('broadcast', { event: 'shout' }, (payload) => {
      const msg = payload['payload']['message'] as string;
      messages.push(msg);
    })
    .subscribe();

  const sendMessage = () => {
    supabase.channel(slug).send({
      type: 'broadcast',
      event: 'shout',
      payload: { message: messageInput }
    });

    messageInput = '';
  };

  onDestroy(() => {
    supabase.removeAllChannels();
  });
</script>

<div>
  <div>
    <h2>Chat éphémère</h2>
    <div>
      <input type="text" placeholder="Message..." bind:value={messageInput} />
      <button onclick={sendMessage}>Send</button>
    </div>
    <div>
      {#each messages as message}
        <p>{message}</p>
      {/each}
    </div>
  </div>
  <table>
    <tbody>
      <tr>
        <td>Points</td>
        <td>Complexity</td>
        <td>Effort</td>
        <td>Uncertainty</td>
      </tr>
      {#each tableData as row}
        <tr>
          <td>{row.pointValue}</td>
          <td>{row.complexity}</td>
          <td>{row.effort}</td>
          <td>{row.uncertainty}</td>
        </tr>
      {/each}
    </tbody>
  </table>
</div>

<style>
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  td:not(:first-child) {
    cursor: pointer;
  }

  td:not(:first-child):hover {
    background-color: #007bff;
  }
</style>
