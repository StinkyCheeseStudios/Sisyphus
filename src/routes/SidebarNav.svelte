<script>
	import Logo from '$lib/components/Logo.svelte';
  import NavDropdownButton from './NavDropdown.svelte';
  import NavItem from './NavItem.svelte';
  import { House, ShieldUser, Pickaxe, BanknoteArrowDown, BanknoteX } from 'lucide-svelte';

	let { isMenuOpen } = $props();
  let activeDropdown = $state('none');
  $inspect(activeDropdown);

  function toggleActiveDropdown(clickedDropdown) {
    if (activeDropdown === clickedDropdown) {
      activeDropdown = 'none';
    }
    else {
      activeDropdown = clickedDropdown;
      isMenuOpen = true;
    }
  }

  /* TO BE CHANGED */
  /* These are obviously mostly joke routes and nav buttons for visual testing purposes only */
  const NavigationItems = [
		{ isDropdown: false, icon: House, text: 'Home', href: '/' },
		{
			isDropdown: true,
			icon: ShieldUser,
			text: 'Administration',
			dropdownItems: [
				{ icon: Pickaxe, text: 'Send Workers to Mine', href: '/work/mining' },
				{ icon: BanknoteArrowDown, text: 'Drop Employee Wage', href: '/wages/reduce' },
        { icon: BanknoteX, text: 'Stop Paying Employees', href: '/wages/remove' }
			]
		}
	];
</script>

<nav
	class="fixed lg:sticky top-0 left-0 z-2 flex h-dvh w-dvw flex-col bg-main-2 transition-all duration-300
    sm:w-75 lg:translate-x-0 shrink-0
    {isMenuOpen ? 'lg:w-75' : '-translate-x-full lg:w-14'}"
>
  <!--Logo centered at the top. Also functions as a spacer under the header-->
	<div 
    class="h-14 w-full relative {isMenuOpen ? 'opacity-100' : 'opacity-0'} transition duration-300"
  >
	  <Logo />
	</div>

	<!--Inside pseudo corner radius element between header and sidebar-->
	<div class="relative">
		<div
			class="absolute right-0 h-8 w-8 translate-x-full rounded-lg bg-transparent shadow-[-4px_-4px_var(--main-2)]
        lg:hidden"
		></div>
	</div>

  <!--Rendering all the NavigationItems-->
  <ul class="overflow-hidden p-1 flex flex-col gap-1">
    {#each NavigationItems as item}
      {#if !item.isDropdown}
        <NavItem {item} />
      {:else}
        <NavDropdownButton {item} {activeDropdown} {toggleActiveDropdown} {isMenuOpen} />
      {/if}
    {/each}
  </ul>
</nav>
