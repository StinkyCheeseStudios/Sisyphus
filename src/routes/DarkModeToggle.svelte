<script>
  import { Sun, Moon } from "lucide-svelte";
  
  let { isDark, toggleDarkMode, isMenuOpen, toggleMenu } = $props();
</script>

<button 
  onclick={toggleDarkMode}
  class="relative w-12 h-8 bg-main-3 rounded-full" 
  aria-label="Toggle dark mode. Currently on {isDark ? 'dark' : 'light'} mode"
  onfocusin={() => { if (!isMenuOpen) { toggleMenu() }}}
  onfocusout={() => { if (isMenuOpen) { toggleMenu() }}}
>
  <div 
    class="bg-main-2 absolute top-1 bottom-1 aspect-square rounded-full transition-[left] duration-300
      {isDark ? 'left-5' : 'left-1'} flex justify-center items-center"
  >
    <Moon size={18} />
  </div>
</button>