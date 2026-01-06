<script>
  import { onMount } from "svelte";
  import { Eye, EyeOff, LogIn, Info } from "lucide-svelte";
	import { fade, fly, slide } from "svelte/transition";
	import PinInput from "./PinInput.svelte";
  import Modal from "$lib/components/Modal.svelte";
  import { page } from "$app/state";

  let { form } = $props();

  let showPassword = $state(false);
  let isLogIn = $state(true);

  let showNotice = $state(false);
  onMount(() => {
    if (page.url.searchParams.get('unauthorized')) {
      showNotice = true
    }
  });
</script>

{#if showNotice}
  <Modal
    type="error"
    closeDelay={8000}
    onClose={() => { showNotice = false }}
  >
    Unauthorized! Please log in as admin.
  </Modal>
{/if}

<div class="w-full h-full flex flex-col justify-center items-center gap-1">
  <form 
    action="?/login" 
    method="POST"
    class="bg-main-2 border border-main-3 flex flex-col p-4 rounded-md gap-4"
  >

    <div class="w-full flex justify-between relative">
      <button
        type="button"
        onclick={() => { isLogIn = true }}
        class="flex-1 py-2 text-lg font-semibold rounded-md hover:scale-105 z-2 
          transition-scale duration-300 {isLogIn ? 'text-fore' : 'text-fore-2'}"
      >
        Log in
      </button>
      <button
        type="button"
        onclick={() => { isLogIn = false }}
        class="flex-1 py-2 text-lg font-semibold rounded-md hover:scale-105 z-2 
          transition-scale duration-300 {isLogIn ? 'text-fore-2' : 'text-fore'}"
      >
        Register
      </button>
      <div
        class="absolute w-1/2 bg-main-3/50 h-full rounded-md transition-all duration-300 border border-main-3
          {isLogIn ? 'left-0' : 'left-1/2'}"
      ></div>
    </div>

    {#if !isLogIn}
      <div
        in:slide={{ duration: 300, axis: "x" }}
        out:fly={{ duration: 300, x: 100 }}
        class="flex flex-col gap-1 items-center"
      >
        <span class="text-nowrap">Sign-up code</span>
        <PinInput />
      </div>
    {/if}

    <div class="flex flex-col gap-1">
      <label 
        for="username"
        class="bg-main-3 w-min px-2 rounded-md text-sm text-fore-2"
      >
        Username
      </label>
      <input 
        required
        type="text" 
        name="username"
        class="bg-main-3 border border-main-4 rounded-md w-70 focus:ring-accent"
      >
    </div>

    <div class="flex flex-col gap-1">
      <label 
        for="password"
        class="bg-main-3 w-min px-2 rounded-md text-sm text-fore-2"
      >
        Password
      </label>
      <div class="relative">
        <input
          autocomplete="off"
          required
          type={showPassword ? 'text' : 'password'}
          name="password"
          class="bg-main-3 border border-main-4 rounded-md w-70 focus:ring-accent"
        >
        <button
          type="button"
          onclick={() => { showPassword = !showPassword }}
          class="absolute right-0 top-1/2 -translate-1/2"
        >
          {#if showPassword}
            <EyeOff size={22} />
          {:else}
            <Eye size={22} />
          {/if}
        </button>
      </div>
    </div>

    <button
      class="flex gap-2 justify-center items-center bg-accent py-3 rounded-md text-main font-semibold group"
    >
      {isLogIn ? 'Log in' : 'Register'}
      <LogIn 
        size={22} 
        class="relative left-0 group-hover:left-1 group-hover:scale-105 transition-all duration-300" 
      />
    </button>

    <input hidden name="isLogIn" value={isLogIn}>
  </form>

  <div
    class=""
  >
    {#if form?.error}
      <span class="text-error">
        {form?.error}
      </span>
    {:else if form?.success}
      <span class="text-success">
        {form?.success}
      </span>
    {/if}
  </div>
</div>