<script>
  import { onMount } from 'svelte';
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';
  import { Sun, Moon } from 'lucide-svelte';
  import Header from './Header.svelte';
  import SidebarNav from './SidebarNav.svelte';
  
	let { children } = $props();

  let isDark = $state(false);
  let isMenuOpen = $state(false);
  $inspect(isMenuOpen);

  function toggleMenu() {
    isMenuOpen = !isMenuOpen;
  }

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

<!--Main content container with flex-col to set sidebar and page content below header-->
<div class="min-h-dvh w-vw flex flex-col">

  <Header {toggleMenu} {isMenuOpen} />
  
  <!--Flex row container for sidebar navigation and pages (children)-->
  <div class="flex">
    <SidebarNav {isMenuOpen} {toggleDarkMode} {isDark} />

    <div class="grow">
      {@render children?.()}
    </div>
  </div>
</div>
