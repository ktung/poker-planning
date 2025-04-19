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

<div>
  <h1>{m.hello_world({ name: username })}</h1>
  {#if !roomId}
    <h1>{m.createRoom()}</h1>
    <label for="username">{m.username()}</label>
    <input id="username" type="text" placeholder="Username" bind:value={username} />
    <button onclick={redirectRandomRoom}>{m.createRoom()}</button>
  {:else}
    <h1>{m.joinRoom({ roomId })}</h1>
    <label for="username">{m.username()}</label>
    <input id="username" type="text" placeholder="Username" bind:value={username} />
    <button onclick={joinRoom}>{m.joinRoom({ roomId })}</button>
  {/if}
</div>

<style>
  div {
    max-width: 400px;
    margin: 2rem auto;
    padding: 2rem;
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    text-align: center;
  }

  h1 {
    color: #333;
    margin-bottom: 1.5rem;
    font-size: 1.8rem;
  }

  input {
    box-sizing: border-box;
    width: 100%;
    padding: 0.8rem;
    margin: 1rem 0;
    border: 2px solid #eaeaea;
    border-radius: 6px;
    font-size: 1rem;
    transition: border-color 0.3s ease;
  }

  input:focus {
    outline: none;
    border-color: #007bff;
  }

  button {
    width: 100%;
    padding: 0.8rem;
    background-color: #007bff;
    color: white;
    border: none;
    border-radius: 6px;
    font-size: 1rem;
    cursor: pointer;
    transition: background-color 0.3s ease;
  }

  button:hover {
    background-color: #0056b3;
  }

  button:active {
    transform: translateY(1px);
  }

  @media (max-width: 480px) {
    div {
      margin: 1rem;
      padding: 1rem;
    }

    h1 {
      font-size: 1.5rem;
    }
  }
</style>
