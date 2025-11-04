<script>
  import { Menu, PanelLeftClose, PanelLeftOpen } from "lucide-svelte";
  import Logo from "$lib/components/Logo.svelte";

  let { toggleMenu, isMenuOpen } = $props();
</script>

<header class="sticky top-0 h-14 bg-main-2 flex z-10 lg:invisible lg:fixed lg:pointer-events-none">

  <!--Menu toggle button-->
  <div class="h-14 w-14 flex justify-center items-center bg-main-2 visible">
    <!--Stays clickable and visible even after header is made invisible and unclickable-->
    <!--Looks like it's part of the sidebar after the lg breakpoint even though it is in the header-->
    <button
      class="w-12 h-12 flex justify-center items-center rounded-md hover:bg-main-3 transition duration-100
        visible pointer-events-auto"
      onclick={toggleMenu}
    >
      {#if isMenuOpen}
        <Menu size={20} class="sm:hidden" />
        <PanelLeftClose size={20} class="hidden sm:block" />
      {:else}
        <Menu size={20} class="sm:hidden" />
        <PanelLeftOpen size={20} class="hidden sm:block" />
      {/if}
    </button>
  </div>

  <!--Logo is an anchor tag that routes to the home page. It centers itself in the parent-->
  <Logo />

</header>