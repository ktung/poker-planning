<script lang="ts">
  import { getLocale, setLocale } from '$lib/paraglide/runtime';

  let locale = $state(getLocale());

  function onChangeLocale(event: Event) {
    const target = event.target as HTMLSelectElement;
    const newLocale = target.value as 'en' | 'fr';
    setLocale(newLocale);
  }
</script>

<select bind:value={locale} onchange={onChangeLocale} aria-label="Language preference:">
  <option value="en">🇬🇧 English</option>
  <option value="fr">🇫🇷 Français</option>
</select>

<style>
  select {
    appearance: base-select;
  }
</style>
