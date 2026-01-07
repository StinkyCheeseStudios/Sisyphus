<script>
  import { onMount, onDestroy } from "svelte";
  import { fly } from "svelte/transition";
  import { cubicOut, quintIn, quintOut } from 'svelte/easing';
  
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

  function popOut(node) {
    const style = getComputedStyle(node);
    const base = style.transform === 'none' ? '' : style.transform;

    return {
      duration: 520,
      css: (t) => {
        const p = 1 - t; // normalize 0 → 1

        let y;

        if (p < 0.35) {
          // Phase 1: small downward anticipation
          const k = p / 0.35;
          y = 8 * cubicOut(k);
        } else {
          // Phase 2: fast fly upward
          const k = (p - 0.35) / 0.65;
          y = 8 - 150 * quintIn(k);
        }

        return `
          transform: ${base} translateY(${y}px);
          opacity: ${t};
        `;
      }
    };
  }
</script>

<div 
  class="bg-main-2 shadow-black shadow-[5px_5px_15px_5px] rounded-md fixed left-1/2 -translate-x-1/2 top-4
    text-fore p-4 px-8 border-l-4 {type} z-9999"
  in:fly={{ y: -30, duration: 350, easing: quintOut }}
  out:popOut
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