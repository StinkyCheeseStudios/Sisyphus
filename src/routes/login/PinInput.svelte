<script>
  import { Info } from "lucide-svelte";
	import { fade } from "svelte/transition";

  const LENGTH = 6;
  
  let chars = $state(Array(LENGTH).fill(""));
  let code = $derived(chars.join(""));

  let showInfo = $state(false);

  function handleInput(e, i) {
    const value = e.target.value.replace(/[^a-zA-Z0-9]/g, "");

    if (!value) return;

    chars[i] = value[0];

    if (i < LENGTH - 1) {
      e.target.nextElementSibling?.focus();
    }
  }

  function handleKeydown(e, i) {
    if (e.key === "Backspace" && !chars[i] && i > 0) {
      e.target.previousElementSibling?.focus();
    }
  }

  function handlePaste(e) {
    e.preventDefault();
    const paste = e.clipboardData.getData("text").replace(/[^a-zA-Z0-9]/g, "");
    if (paste.length !== LENGTH) return;

    chars = paste.split("").slice(0, LENGTH);
  }
</script>

<div
  class="flex gap-1 relative"
  onpaste={(e) => { handlePaste(e) }}
>
  {#each chars as _, i}
    <input
      type="text"
      maxlength="1"
      required
      bind:value={chars[i]}
      oninput={(e) => handleInput(e, i)}
      onkeydown={(e) => handleKeydown(e, i)}
      class="w-8 h-10 text-center text-xl border border-main-4 rounded-md bg-main-3 p-0 m-0
        focus:ring-accent"
    />
  {/each}
  
  <button
    type="button"
    aria-label="Toggle info about sign-up code. Currently info is {showInfo ? '' : 'not'} visible"
    onmouseenter={() => { showInfo = true; }}
    onmouseleave={() => { showInfo = false; }}
    onclick={() => { showInfo = !showInfo; }}
    class="text-fore-2 absolute -right-1 translate-x-full"
  >
    <Info size={12} class="shrink-0" />
    
    {#if showInfo}
      <div
        transition:fade={{ duration: 150 }}
        class="bg-main-3 rounded-md w-50 absolute right-0 -bottom-1 px-2 py-1 text-fore translate-y-full
          shadow-[5px_5px_10px_3px] shadow-black border border-main-4
          md:left-0 "
      >
        <span
          class=""
        >
          Enter a six digit code from your employer
        </span>
      </div>
    {/if}
  </button>

  <input hidden name="signupCode" value={code}>
</div>