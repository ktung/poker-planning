<script lang="ts">
  import type { PageData } from './$types';
  import Chat from '$lib/components/chat.svelte';
  import { m } from '$lib/paraglide/messages';
  import { pointsValues, tableData } from '$lib/assets/data';
  import { supabase } from '$lib/supabaseClient';
  import { onDestroy, onMount } from 'svelte';
  import { upsertVote } from '$lib/db/votes';
  import { logger } from '$lib/util/logger';
  import Voters from '$lib/components/voters.svelte';
  import { REALTIME_LISTEN_TYPES, REALTIME_PRESENCE_LISTEN_EVENTS, REALTIME_SUBSCRIBE_STATES } from '@supabase/supabase-js';
  import { round2 } from '$lib/util/math';

  const { data }: { data: PageData } = $props();
  const { roomId, slug, sessionId } = data;

  let showChat = $state(false);

  onMount(() => {
    showChat = true;
    const roomChannel = supabase.channel(slug);
    const channelPresence = supabase.channel(`presence:${slug}`, {
      config: {
        presence: {
          key: slug
        }
      }
    });

    channelPresence
      .on(REALTIME_LISTEN_TYPES.PRESENCE, { event: REALTIME_PRESENCE_LISTEN_EVENTS.SYNC }, () => {
        const state = channelPresence.presenceState();
        logger.debug('sync', state);
      })
      .on(REALTIME_LISTEN_TYPES.PRESENCE, { event: REALTIME_PRESENCE_LISTEN_EVENTS.JOIN }, ({ key, newPresences }) => {
        logger.debug('join', key, newPresences);
      })
      .on(REALTIME_LISTEN_TYPES.PRESENCE, { event: REALTIME_PRESENCE_LISTEN_EVENTS.LEAVE }, ({ key, leftPresences }) => {
        logger.debug('leave', key, leftPresences);
      })
      .subscribe(async (status) => {
        if (status !== REALTIME_SUBSCRIBE_STATES.SUBSCRIBED) {
          logger.error(`Error subscribing to presence channel: ${status}`);
          return;
        }

        const userStatus = {
          userId: sessionId,
          online_at: new Date().toISOString()
        };
        const presenceTrackStatus = await channelPresence.track(userStatus);
        logger.debug('presence status', presenceTrackStatus);
      });

    roomChannel
      .on(REALTIME_LISTEN_TYPES.BROADCAST, { event: 'clearVotes' }, () => {
        activeCell = {
          complexity: null,
          effort: null,
          uncertainty: null
        };
      })
      .subscribe();

    return () => {
      roomChannel.unsubscribe();
      channelPresence.untrack();
      channelPresence.unsubscribe();
    };
  });

  onDestroy(async () => {
    const { error } = await supabase.from('users').delete().match({
      room_id: roomId,
      session_id: sessionId
    });

    if (error) {
      logger.error('Error deleting user:', error);
    }
  });

  let activeCell = $state({
    complexity: null as number | null,
    effort: null as number | null,
    uncertainty: null as number | null
  });

  let selectedPointsValues = $state({
    complexity: null as number | null,
    effort: null as number | null,
    uncertainty: null as number | null
  });

  let mean = $derived.by(() => {
    const nbSelected = Object.values(activeCell).filter((value) => value !== null).length;
    logger.debug('selectedPointsValues', $state.snapshot(selectedPointsValues));
    logger.debug('nbSelected', nbSelected);
    const mean =
      ((selectedPointsValues.complexity || 0) + (selectedPointsValues.effort || 0) + (selectedPointsValues.uncertainty || 0)) / nbSelected;
    return round2(mean);
  });

  let pointValueOverMean = $derived.by(() => {
    return pointsValues.find((value) => value >= mean) ?? pointsValues[pointsValues.length - 1];
  });

  async function handleClick(event: MouseEvent, type: 'complexity' | 'effort' | 'uncertainty', index: number) {
    if (activeCell[type] === index) {
      activeCell[type] = null;
      selectedPointsValues[type] = null;
      return;
    } else {
      activeCell[type] = index;
    }

    const target = event.target as HTMLTableCellElement;
    const row = target.parentElement;
    if (row) {
      const pointValue = row.children[0].textContent;
      if (pointValue) {
        selectedPointsValues[type] = parseFloat(pointValue);
      }
    }

    const { error } = await upsertVote(sessionId, roomId, type, selectedPointsValues[type]);
    if (error) {
      logger.error('Error upserting vote', error);
    }
  }

  let savedVotes = $state([]);
  function showVotes() {
    supabase
      .from('votes')
      .select('complexity, effort, uncertainty, users (username)')
      .eq('room_id', roomId)
      .then(({ data, error }) => {
        if (error) {
          logger.error('Error fetching votes:', error);
        } else {
          logger.debug('Votes:', data);
          savedVotes = data;

          activeCell = {
            complexity: null,
            effort: null,
            uncertainty: null
          };
        }
      });
  }
  function clearVote() {
    supabase.channel(slug).send({
      type: 'broadcast',
      event: 'clearVotes',
      payload: {}
    });
  }
</script>

<section>
  <div>
    <span>Invite your team to the room: </span><span class="invite-link">http://localhost:5173/?join={slug}</span>
    <button onclick={showVotes}>Show votes</button>
    <button onclick={clearVote}>Clear votes</button>
  </div>

  <div class="infos">
    {#if showChat}
      <Chat {slug} />
    {/if}
    <div>
      <table>
        <thead>
          <tr>
            <th>Username</th>
            <th>Complexity</th>
            <th>Effort</th>
            <th>Uncertainty</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>ptung</td>
            <td>✅</td>
            <td>🤔</td>
            <td>✅</td>
          </tr>
        </tbody>
      </table>
    </div>
    <div class="stats">
      Mean {mean}
      Point over mean {pointValueOverMean}
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th>{m.points()}</th>
        <th>{m.complexity()}</th>
        <th>{m.effort()}</th>
        <th>{m.uncertainty()}</th>
      </tr>
    </thead>
    <tbody>
      {#each tableData as row, index (row.pointValue)}
        <tr>
          <td>{row.pointValue}</td>
          <td class:active={activeCell.complexity === index} onclick={(ev) => handleClick(ev, 'complexity', index)}>
            {row.complexity}
            <Voters votes={savedVotes} selectedType="complexity" selectedValue={row.pointValue} />
          </td>
          <td class:active={activeCell.effort === index} onclick={(ev) => handleClick(ev, 'effort', index)}
            >{row.effort}
            <Voters votes={savedVotes} selectedType="effort" selectedValue={row.pointValue} />
          </td>
          <td class:active={activeCell.uncertainty === index} onclick={(ev) => handleClick(ev, 'uncertainty', index)}
            >{row.uncertainty}
            <Voters votes={savedVotes} selectedType="uncertainty" selectedValue={row.pointValue} />
          </td>
        </tr>
      {/each}
    </tbody>
  </table>
</section>

<style>
  .infos {
    display: flex;
    justify-content: space-around;
    margin-bottom: 2rem;
  }

  .stats {
    margin: 1rem 0;
    background: white;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    border-radius: 8px;
    padding: 1rem;
  }

  section {
    max-width: 1200px;
    margin: 0 auto;
    padding: 2rem;
  }

  .invite-link {
    background: #f8f9fa;
    border-radius: 6px;
    margin-bottom: 2rem;
  }

  button {
    padding: 0.8rem 1.5rem;
    background-color: #007bff;
    color: white;
    border: none;
    border-radius: 6px;
    font-size: 1rem;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  button:hover {
    background-color: #0056b3;
    transform: translateY(-1px);
  }

  button:active {
    transform: translateY(0);
  }

  table {
    width: 100%;
    margin: 20px auto;
    border-collapse: collapse;
    background-color: white;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
    border-radius: 8px;
    overflow: hidden;
  }

  td,
  th {
    padding: 12px 15px;
    text-align: center;
    border-bottom: 1px solid #ddd;
  }

  tr:nth-child(even) {
    background-color: #f8f9fa;
  }

  tr:hover {
    background-color: #f0f0f0;
  }

  thead tr:first-child {
    background-color: #007bff;
    color: white;
    font-weight: 500;
  }

  tbody td:not(:first-child) {
    cursor: pointer;
    transition: all 0.2s ease;
  }

  tbody td:not(:first-child).active,
  tbody td:not(:first-child):hover {
    background-color: #007bff;
    color: white;
  }

  @media (max-width: 768px) {
    td,
    th {
      padding: 8px;
      font-size: 0.875rem;
    }

    section {
      padding: 0;
    }

    .infos {
      flex-direction: column;
    }
  }
</style>
