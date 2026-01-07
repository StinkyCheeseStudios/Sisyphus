<script>
	import { Copy, Check, RefreshCw, Trash2, SquarePen, X } from 'lucide-svelte';
	import { fade, scale } from 'svelte/transition';
  import { ui } from '$lib/state/global.svelte';

	let { worker } = $props();

  let editing = $state(false);
  let confirmDelete = $state(false);
  let copied = $state(false);

  function openConfirmDelete() {
    confirmDelete = true;
    ui.onBlurClick = () => {
      confirmDelete = false;
    }
    ui.isBackgroundBlur = true;
  }
  function closeConfirmDelete() {
    confirmDelete = false;
    ui.onBlurClick = null;
    ui.isBackgroundBlur = false;
  }

  function handleCopy(code) {
    navigator.clipboard.writeText(code);
    copied = true;

    setTimeout(() => {
      copied = false;
    }, 2500)
  }
</script>

<div class="flex w-full flex-col gap-2 rounded-md bg-main-3 p-2">
	<div class="flex flex-col">
    {#if editing}
      <form action="?/modifyEmployee" method="POST" class="flex flex-col gap-1">
        <input 
          type="text"
          value={worker.name}
          name="name"
          id="modifyNameInput"
          class="bg-main-4 rounded-md border-none outline-none ring-none text-sm focus:ring-accent"
        >
        <div class="flex gap-1">
          <input
            type="number"
            value={worker.hoursPerWeek}
            name="hours"
            id="modifyHoursInput"
            class="bg-main-4 rounded-md border-none outline-none ring-none text-sm focus:ring-accent grow flex-1"
          >
          <button
            type="submit"
            class="h-full aspect-square rounded-md bg-accent p-1 text-main flex justify-center items-center
              transition-colors duration-300 hover:bg-accent/70"
          >
            <Check size={18} />
          </button>
        </div>

        <input type="hidden" name="id" value={worker.id} >
      </form>
    {:else}
		  <span class="text-lg">{worker.name}</span>
		  <span class="text-fore-3">
		  	{worker.hoursPerWeek}h/week
		  </span>
    {/if}
	</div>

	<div class="flex items-center justify-between">

		<!--RESET SIGNUP TOKEN EXPIRY FORM-->
		<form action="?/resetSignupToken" method="POST">
			<!--BUTTON EITHER RESETS SIGNUP TOKEN EXPIRY, COPIES CODE TO CLIPBOARD OR DOES NOTHING-->
			<button
				type={worker.signupExpired ? 'submit' : 'button'}
				disabled={worker.signupUsed}
				onclick={!worker.signupExpired
					? () => {
							handleCopy(worker.signupCode);
						}
					: undefined}
				class="flex items-center justify-center gap-1.5 rounded-md px-1 text-main transition-colors sm:duration-300
          active:scale-90 duration-25
                  {worker.signupUsed
					? 'bg-success hover:bg-success/70'
					: worker.signupExpired
						? 'bg-warning hover:bg-warning/70'
						: 'bg-accent hover:bg-accent/70'}"
			>
				{worker.signupUsed ? 'Activated!' : worker.signupExpired ? 'Expired!' : worker.signupCode}
				{#if !worker.signupExpired && !worker.signupUsed}
					
          <!--Cursed stuff to make animation look nice-->
          <!--I am sorry for any distress this code may cause-->
          <div class="relative">
            {#if copied}
              <div
                in:scale={{ delay: 500, duration: 500 }}
                out:scale={{ duration: 500 }}
                class="absolute left-1/2 top-1/2 -translate-1/2"
              >
                <Check size={16} />
              </div>
            {:else}
              <div
                in:scale={{ delay: 500, duration: 500 }}
                out:scale={{ duration: 500 }}
                class="absolute left-1/2 top-1/2 -translate-1/2"
              >
                <Copy size={14} />
              </div>
            {/if}
            <!--This is an invisible spacer since I could not figure out a less annoying way to keep the space same-->
            <!--Again, I am so sorry-->
            <Check size={14} class="invisible" />
          </div>

				{:else if worker.signupExpired}
					<RefreshCw size={14} />
				{/if}
			</button>
			<input type="hidden" name="id" value={worker.id} />
		</form>

		<div class="flex items-center gap-1">
			<!--DELETE WORKER BUTTON, CONFIRMATION POPUP, AND FORM-->
			<form action="?/deleteEmployee" method="POST">
				<button
          type="button"
          onclick={openConfirmDelete}
					class="h-min rounded-md bg-error p-1 text-main transition-colors duration-300 hover:bg-error/70"
				>
					<Trash2 size={18} />
				</button>
				<input type="hidden" name="id" value={worker.id} />

        <div 
          class="fixed p-6 rounded-md bg-main-2 shadow-black shadow-[5px_5px_25px_5px] flex flex-col gap-5
            {confirmDelete ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'} 
            -translate-1/2 top-1/2 left-1/2 transition-all duration-250 z-999"
        >
          <span>
            Are you sure you want to delete 
            <span class="font-semibold">
              {worker.name}
            </span>
            ?
          </span>

          <div class="flex w-8/10 gap-1 mx-auto">
            <button
              type="submit"
              class="rounded-md bg-error p-1 text-main flex-1 font-semibold"
            >
              Yes, delete!
            </button>
            <button
              type="button"
              onclick={closeConfirmDelete}
              class="rounded-md bg-main-3 p-1 flex-1"
            >
              Cancel
            </button>
          </div>

        </div>
			</form>

			<!--EDIT BUTTON-->
			<button
				class="h-min rounded-md p-1 text-main transition-colors duration-300 hover:bg-accent/70
          {editing ? 'bg-accent/70' : 'bg-accent'}"
        onclick={() => { editing = !editing }}
			>
        {#if editing}
          <X size={18} />
        {:else}
				  <SquarePen size={18} />
        {/if}
			</button>

		</div>

	</div>
</div>
