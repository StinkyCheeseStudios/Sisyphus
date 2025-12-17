<script>
	import { Copy, Check, RefreshCw, Trash2, SquarePen } from 'lucide-svelte';
	import { scale } from 'svelte/transition';

	let { worker } = $props();

  let copied = $state(false);

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
		<span class="text-lg">{worker.name}</span>
		<span class="text-fore-3">
			{worker.hoursPerWeek}h/week
		</span>
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
			<!--DELETE WORKER BUTTON AND FORM-->
			<form action="?/deleteEmployee" method="POST">
				<button
					class="h-min rounded-md bg-error p-1 text-main transition-colors duration-300 hover:bg-error/70"
				>
					<Trash2 size={18} />
				</button>
				<input type="hidden" name="id" value={worker.id} />
			</form>

			<!--EDIT BUTTON // CURRENTLY DOES NOTHING-->
			<button
				class="h-min rounded-md bg-accent p-1 text-main transition-colors duration-300 hover:bg-accent/70"
			>
				<SquarePen size={18} />
			</button>
		</div>

	</div>
</div>
