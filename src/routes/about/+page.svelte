<script>
  import { m } from '$lib/paraglide/messages';
</script>

<svelte:head>
  <title>{m.about()} | Poker Planning</title>
</svelte:head>

<section>
  <h2>{m.about_data_title()}</h2>
  <p>{m.about_data()}</p>

  <h2>{m.about_howto_title()}</h2>
  <ul>
    <li>{m.about_howto_recommanded_value()}</li>
    <li>{m.about_howto_minmax()}</li>
    <li>{m.about_howto_red()}</li>
  </ul>
</section>
