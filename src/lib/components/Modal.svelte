<script>
  import { onMount, onDestroy } from "svelte";
  import { fade } from "svelte/transition";
  
  let { 
    children, 
    type,
    closeDelay = 0,
    onClose = () => {}
  } = $props();

  let timer;

	onMount(() => {
		if (closeDelay > 0) {
			timer = setTimeout(() => {
				onClose();
			}, closeDelay);
		}
	});

	onDestroy(() => clearTimeout(timer));
</script>

<div 
  class="bg-main-2 shadow-black shadow-[5px_5px_15px_5px] rounded-md fixed left-1/2 -translate-x-1/2 top-4
    text-fore p-4 px-8 border-l-4 {type} z-9999"
  out:fade={{ duration: 500 }}
>
  {@render children?.()}
</div>


<style>
  .success {
    border-color: var(--success);
  }
  .warning {
    border-color: var(--warning);
  }
  .error {
    border-color: var(--error);
  }
</style>