<script lang="ts">
  let { usersStatuses } = $props();
</script>

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
      {#each usersStatuses as user, i (i)}
        <tr>
          <td>{user.username}</td>
          <td>{user.complexity}</td>
          <td>{user.effort}</td>
          <td>{user.uncertainty}</td>
        </tr>
      {/each}
    </tbody>
  </table>
</div>

<style>
  table {
    width: 100%;
    margin: 20px auto;
    border-collapse: collapse;
    background-color: white;
    box-shadow: 0 1px 3px var(--shadow-dark);
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
    background-color: var(--primary-color);
    color: white;
    font-weight: 500;
  }

  tbody td:not(:first-child) {
    cursor: pointer;
    transition: all 0.2s ease;
  }

  @media (max-width: 768px) {
    td,
    th {
      padding: 8px;
      font-size: 0.875rem;
    }
  }
</style>
