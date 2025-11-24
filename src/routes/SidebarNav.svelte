<script>
	import Logo from '$lib/components/Logo.svelte';
  import NavDropdown from './NavDropdown.svelte';
  import NavItem from './NavItem.svelte';
  import DarkModeToggle from './DarkModeToggle.svelte';
  import { 
    House, 
    ShieldUser, 
    Pickaxe, 
    BanknoteArrowDown, 
    BanknoteX, 
    Sun, 
    Moon,
    UserPlus,
    LayoutDashboard,
    LogIn
  } from 'lucide-svelte';

	let { isMenuOpen, toggleDarkMode, isDark, toggleMenu } = $props();
  let activeDropdown = $state('none');
  $inspect(`ACTIVE DROPDOWN: ${activeDropdown}`);

  function toggleActiveDropdown(clickedDropdown) {
    // If the dropdown being clicked is already open AND menu is open, the user wants to close it, so do that.
    // If the menu is not open the user does not see the dropdown as open, so likely they are trying to open it
    //   even if it is already open.
    if (activeDropdown === clickedDropdown && isMenuOpen) {
      activeDropdown = 'none';
    }
    // Else they want to open it, so open it.
    else {
      activeDropdown = clickedDropdown;
    }

    // Finally if the menu is closed and a dropdown is clicked, open the menu.
    if (!isMenuOpen) {
      toggleMenu();
    }
  }

  /* TO BE CHANGED */
  /* These are obviously mostly joke routes and nav buttons for visual testing purposes only */
  const NavigationItems = [
		{ isDropdown: false, icon: House, text: 'Home', href: '/' },
    { isDropdown: false, icon: UserPlus, text: 'Add User (temp)', href: '/temp/add-user' },
    { isDropdown: false, icon: LogIn, text: 'Login', href: '/login' },
		{
			isDropdown: true,
			icon: ShieldUser,
			text: 'Administration',
			dropdownItems: [
        { icon: LayoutDashboard, text: 'Admin Dashboard', href: '/admin/dashboard' },
				{ icon: Pickaxe, text: 'Send Workers to Mine', href: '/work/mining' },
				{ icon: BanknoteArrowDown, text: 'Drop Employee Wage', href: '/wages/reduce' },
        { icon: BanknoteX, text: 'Stop Paying Employees', href: '/wages/remove' }
			]
		}
	];
</script>

<nav
	class="fixed lg:sticky top-0 left-0 z-9 flex h-dvh w-dvw flex-col bg-main-2 transition-all duration-300
    sm:w-75 lg:translate-x-0 shrink-0
    {isMenuOpen ? 'lg:w-75' : '-translate-x-full lg:w-14'}"
>
  <!--Logo centered at the top. Also functions as a spacer under the header-->
	<div 
    class="h-14 shrink-0 w-full relative transition duration-300
      {isMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}"
    inert="true"
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
  <ul class="relative overflow-hidden p-1 pt-0 flex flex-col gap-1 h-full">
    {#each NavigationItems as item}
      {#if !item.isDropdown}
        <NavItem {item} />
      {:else}
        <NavDropdown {item} {activeDropdown} {toggleActiveDropdown} {isMenuOpen} />
      {/if}
    {/each}

    <!--Dark mode toggle button at the bottom of sidebar-->
    <li 
      class="mt-auto flex justify-center items-center gap-4 h-12 {isMenuOpen ? 'opacity-100' : 'opacity-0'}
        transition-opacity duration-200"
    >
      <span class="relative bottom-px text-fore-3">
        Appearance
      </span>
      <DarkModeToggle {isDark} {toggleDarkMode} {isMenuOpen} {toggleMenu} />
    </li>
  </ul>
</nav>
