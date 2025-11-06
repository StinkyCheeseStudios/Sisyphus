<script>
	let showPassword = false;
</script>

<div class="mx-auto w-[90%] md:w-[350px]">
	<form
		class="mx-auto my-24 flex flex-col gap-4 rounded-xl border border-(--main-3) bg-(--main-1)/90 p-6 shadow-lg"
		on:submit|preventDefault
	>
		<h1 class="text-center text-lg font-semibold text-(--fore-1)">Sign in</h1>

		<div class="mx-auto flex w-full flex-col items-center gap-6 p-4">
			<!-- USERNAME -->
			<div class="field relative flex w-full flex-col gap-2">
				<label for="username" class="mx-auto text-center text-sm text-(--fore-2)"> Username </label>

				<input
					id="username"
					name="username"
					type="text"
					autocomplete="username"
					class="mx-auto form-input w-full rounded-md border border-(--main-3) bg-(--main-2) px-3 py-2 pr-10 text-(--fore-1) focus:border-(--accent-1) focus:ring-2 focus:ring-(--accent-1)"
				/>
			</div>

			<!-- PASSWORD -->
			<div class="field relative flex w-full flex-col gap-2">
				<label for="password" class="mx-auto text-center text-sm text-(--fore-2)"> Password </label>

				<!-- WRAPPER: same width as the input; THIS is the element the button is positioned inside -->
				<div class="relative mx-auto w-full">
					<input
						id="password"
						name="password"
						type={showPassword ? 'text' : 'password'}
						autocomplete="current-password"
						class="block w-full rounded-md border border-(--main-3) bg-(--main-2) px-3 py-2 pr-14 text-(--fore-1) focus:border-(--accent-1) focus:ring-2 focus:ring-(--accent-1)"
					/>

					<!-- TOGGLE: fills the input height (inset-y-0) and centers the icon with flex -->
					<button
						type="button"
						class="absolute inset-y-0 right-3 z-10 flex items-center justify-center p-0 text-(--fore-1) hover:opacity-80"
						on:click={() => (showPassword = !showPassword)}
						aria-label="Toggle password visibility"
					>
						{#if showPassword}
							<!-- Eye open -->
							<svg
								xmlns="http://www.w3.org/2000/svg"
								width="20"
								height="20"
								fill="none"
								stroke="currentColor"
								stroke-width="2"
								stroke-linecap="round"
								stroke-linejoin="round"
								viewBox="0 0 24 24"
								class="block"
							>
								<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
								<circle cx="12" cy="12" r="3" />
							</svg>
						{:else}
							<!-- Eye closed -->
							<svg
								xmlns="http://www.w3.org/2000/svg"
								width="20"
								height="20"
								fill="none"
								stroke="currentColor"
								stroke-width="2"
								stroke-linecap="round"
								stroke-linejoin="round"
								viewBox="0 0 24 24"
								class="block"
							>
								<path
									d="M17.94 17.94A10.94 10.94 0 0 1 12 20c-7 0-11-8-11-8a20.91 20.91 0 0 1 5.06-6.88"
								/>
								<path d="M1 1l22 22" />
								<path d="M14.12 14.12A3 3 0 0 1 9.88 9.88" />
							</svg>
						{/if}
					</button>
				</div>
			</div>

			<div class="mx-auto w-full">
				<button
					type="submit"
					class="relative flex w-full items-center justify-center gap-2 rounded-md bg-(--accent-1) 
					px-4 py-2 text-(--fore-1) transition hover:brightness-110 focus:ring-2 focus:ring-(--accent-1)
					cursor-pointer hover:opacity-80 ease-in-out hover:translate-y-1 hover:scale-105">
					<!-- Login icon -->
					<svg
						xmlns="http://www.w3.org/2000/svg"
						width="18"
						height="18"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
					>
						<path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
						<polyline points="10 17 15 12 10 7" />
						<line x1="3" y1="12" x2="15" y2="12" />
					</svg>

					Login
				</button>
			</div>
		</div>
	</form>
</div>
