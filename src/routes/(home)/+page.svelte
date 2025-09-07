<script lang="ts">
  import { m } from '$lib/paraglide/messages';
  import { createRoom } from '$lib/remote/rooms.remote';
  import { logger } from '$lib/util/logger';
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
</script>

<div>
  <h1>{m.hello_world({ name: username })}</h1>
  <form
    {...createRoom.enhance(async ({ form, submit }) => {
      try {
        await submit();
        form.reset();
        window.localStorage.setItem('username', username);
      } catch (error) {
        logger.error('Error creating room', error);
      }
    })}
  >
    <label for="username">{m.username()}</label>
    <input id="username" type="text" name="username" placeholder="Username" bind:value={username} />
    <button>{m.createRoom()}</button>
  </form>
</div>

<style>
  div {
    max-width: 400px;
    margin: 2rem auto;
    padding: 2rem;
    background: white;
    border-radius: var(--radius-small);
    box-shadow: var(--shadow-100);
    text-align: center;
  }

  h1 {
    color: #333;
    margin-bottom: 1.5rem;
    font-size: 1.8rem;
    word-break: break-all;
  }

  input {
    box-sizing: border-box;
    width: 100%;
    padding: 0.8rem;
    margin: 1rem 0;
    border: 2px solid #eaeaea;
    border-radius: var(--radius-small);
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
    border-radius: var(--radius-small);
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
