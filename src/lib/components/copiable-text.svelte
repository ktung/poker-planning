<script lang="ts">
  import { logger } from '$lib/util/logger';

  const { text }: { text: string } = $props();

  let copyFeedback = $state(false);
  async function copyInviteLink() {
    try {
      await navigator.clipboard.writeText(text);
      copyFeedback = true;
      setTimeout(() => {
        copyFeedback = false;
      }, 2000);
    } catch (err) {
      logger.error('Failed to copy invite link:', err);
    }
  }
</script>

<a class="invite-link" class:copied={copyFeedback} onclick={copyInviteLink}>{text}</a>
{#if copyFeedback}
  <span class="tooltip">Copied!</span>
{/if}

<style>
  .invite-link {
    cursor: pointer;
    font-style: italic;
  }

  .tooltip {
    left: 50%;
    transform: translateX(-50%);
    background: #333;
    color: white;
    padding: 4px 8px;
    border-radius: var(--radius-small);
    font-size: 0.875rem;
    animation: fadeIn 0.2s ease;
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translate(-50%, -10px);
    }
    to {
      opacity: 1;
      transform: translate(-50%, 0);
    }
  }
</style>
