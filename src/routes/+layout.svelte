<script>
  import { onMount } from 'svelte';
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';
  import { Sun, Moon } from 'lucide-svelte';
  
	let { children } = $props();

  let isDark = $state(false);

  function toggleDarkMode() {
    if (isDark) {
      localStorage.setItem('theme', 'light');
      isDark = false;
    }
    else {
      localStorage.setItem('theme', 'dark');
      isDark = true;
    }
  }

  $effect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  });

  onMount(() => {
    const saved = localStorage.getItem('theme');

    if (saved === 'dark') {
      isDark = true;
      return;
    }
    if (saved === 'light') {
      isDark = false;
      return;
    }
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    isDark = prefersDark;

    localStorage.setItem('theme', prefersDark ? 'dark' : 'light');
  });
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<div class="min-h-dvh w-dvw flex flex-wrap gap-6 px-30 py-10 transition-colors">
  <button 
    class="bg-accent text-main p-1.5 w-min h-min rounded-md fixed top-1 left-1"
    onclick={toggleDarkMode}
  >
    {#if isDark}
      <Sun />
    {:else}
      <Moon />
    {/if}
  </button>
  
  {@render children?.()}
</div>
