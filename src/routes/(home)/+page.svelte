<script lang="ts">
  import { goto } from '$app/navigation';
  import { m } from '$lib/paraglide/messages';
  import { nanoid } from 'nanoid';
  import { onMount } from 'svelte';
  import type { Snapshot } from './$types';

  let username = $state('');
  onMount(() => {
    username = window.localStorage.getItem('username') ?? '';
  });

  export const snapshot: Snapshot<string> = {
    capture: () => username,
    restore: (value) => (username = value)
  };

  function redirectRandomRoom() {
    const randomRoomId = nanoid();
    window.localStorage.setItem('username', username);
    goto(`/${randomRoomId}`);
  }
</script>

<div>
  <h1>{m.hello_world({ name: username })}</h1>
  <label for="username">{m.username()}</label>
  <input id="username" type="text" placeholder="Username" bind:value={username} />
  <button onclick={redirectRandomRoom}>{m.createRoom()}</button>
</div>

<style>
  div {
    max-width: 400px;
    margin: 2rem auto;
    padding: 2rem;
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 4px var(--shadow);
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
    border-color: var(--primary-color);
  }

  button {
    width: 100%;
    padding: 0.8rem;
    background-color: var(--primary-color);
    color: white;
    border: none;
    border-radius: 6px;
    font-size: 1rem;
    cursor: pointer;
    transition: background-color 0.3s ease;
  }

  button:hover {
    background-color: var(--primary-color-active);
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
