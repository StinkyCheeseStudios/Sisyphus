<script>
  import NavItem from "./NavItem.svelte";
  import { ChevronDown } from "lucide-svelte";
  import { slide } from "svelte/transition";
  import { page } from "$app/state";

  let { item, activeDropdown, toggleActiveDropdown, isMenuOpen } = $props();
</script>

<li class="w-full flex flex-col gap-1">
  <button 
    onclick={() => { toggleActiveDropdown(item.text) }}
    class="w-full h-12 bg-main-3 hover:bg-main-4 rounded-md flex items-center"
  >
    <div class="h-full aspect-square flex justify-center items-center">
      <item.icon size={20} />
    </div>
    <span class="flex justify-center items-center ml-4">
      {item.text}
    </span>
    <div 
      class="ml-auto h-full aspect-square flex justify-center items-center transition duration-300
        {activeDropdown === item.text ? '-rotate-180' : ''}"
    >
      <ChevronDown size={20} />
    </div>
  </button>

  {#if activeDropdown === item.text && isMenuOpen}
    <ul 
      class="flex flex-col gap-1 ml-0.5"
      transition:slide={{ duration: 300 }}
    >
      {#each item.dropdownItems as item}
        <li class="flex gap-1 w-full">
          <div 
            class="w-1 h-full rounded-full shrink-0 {page.url.pathname === item.href ? 'bg-accent' : 'bg-main-3'}"
          ></div>
          <div class="grow">
            <NavItem {item} />
          </div>
        </li>
      {/each}
    </ul>
  {/if}
</li>