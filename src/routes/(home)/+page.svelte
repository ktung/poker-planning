<script lang="ts">
  import { m } from '$lib/paraglide/messages';
  import { onMount } from 'svelte';
  import type { PageData } from './$types';

  const { data }: { data: PageData } = $props();
  const roomId = data.join;

  let username = $state('');
  onMount(() => {
    username = window.localStorage.getItem('username') ?? '';
  });

  function redirectRandomRoom() {
    const array = new Uint32Array(1);
    crypto.getRandomValues(array);
    const randomRoomId = array[0].toString(36).substring(0, 6);
    window.localStorage.setItem('username', username);
    window.location.href = `/${randomRoomId}`;
  }

  function joinRoom() {
    window.localStorage.setItem('username', username);
    window.location.href = `/${roomId}`;
  }
</script>

<h1>{m.hello_world({ name: username })}</h1>

{#if !roomId}
  <div>
    <h1>Create a new room</h1>
    <input type="text" placeholder="Username" bind:value={username} />
    <button onclick={redirectRandomRoom}>Create room</button>
  </div>
{:else}
  <div>
    <h1>Join the {roomId} room</h1>
    <input type="text" placeholder="Username" bind:value={username} />
    <button onclick={joinRoom}>Join room</button>
  </div>
{/if}

<style>
  h1 {
    color: #333;
  }

  input {
    margin: 10px;
    padding: 5px;
    border-radius: 4px;
    border: 1px solid #ccc;
  }

  button {
    padding: 5px 10px;
    background-color: #007bff;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  }

  button:hover {
    background-color: #0056b3;
  }
</style>
