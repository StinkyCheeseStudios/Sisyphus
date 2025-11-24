<script>
	import { enhance } from '$app/forms';

	//data from server
	let { data, form } = $props();

	//local state
	let generatedSchedule = $state(null);
	let generatedStats = $state([]);
	let generatedWarnings = $state([]);
	let editingWorkerId = $state(null);
	let scheduleStartDate = $state('');
	let scheduleEndDate = $state('');
	let isEditMode = $state(false);
	let editedSchedule = $state(null);
	let editingShiftIndex = $state(null);
	let scheduleModified = $state(false);
	let editWarnings = $state([]);

	//computed: which schedule to display
	let displaySchedule = $derived(
		isEditMode
			? editedSchedule
			: generatedSchedule
				? generatedSchedule
				: data.savedSchedule?.shifts || null
	);

	let displayStats = $derived(generatedStats.length > 0 ? generatedStats : null);

	//Track where schedule came from
	let scheduleSource = $derived(
		isEditMode ? 'editing' : generatedSchedule ? 'generated' : data.savedSchedule ? 'saved' : null
	);

	//when entering edit mode, create a working copy
	function enterEditMode() {
		isEditMode = true;

		//edit either generated schedule OR saved schedule
		const sourceSchedule = generatedSchedule || data.savedSchedule?.shifts;
		if (sourceSchedule) {
			editedSchedule = JSON.parse(JSON.stringify(sourceSchedule));

			// Set dates if editing saved schedule
			if (!scheduleStartDate && data.savedSchedule) {
				scheduleStartDate = data.savedSchedule.startDate;
				scheduleEndDate = data.savedSchedule.endDate;
			}
		}

		scheduleModified = false;
		editWarnings = [];
	}

	function exitEditMode() {
		isEditMode = false;
		editedSchedule = null;
		editingShiftIndex = null;
		scheduleModified = false;
		editWarnings = [];
	}

	//update specific shift
	function updateShift(index, newWorkerId) {
		const shift = editedSchedule[index];

		if (newWorkerId === 'empty') {
			// Make shift empty
			shift.workerId = null;
			shift.workerName = 'Unassigned';
			shift.hours = 0;
			shift.isEmpty = true;
			shift.isPartial = false;
		} else {
			// Find worker
			const worker = data.workers.find((w) => w.id === newWorkerId);
			if (worker) {
				shift.workerId = worker.id;
				shift.workerName = worker.name;
				shift.isEmpty = false;
				// Keep existing hours or default to shift duration
				if (shift.hours === 0) {
					shift.hours = data.params.shiftDurationHours;
					shift.isPartial = false;
				}
			}
		}

		editedSchedule = [...editedSchedule]; //trigger reactivity
		scheduleModified = true;
		editingShiftIndex = null;

		// Check for warnings
		checkEditWarnings();
	}

	//Check if edits violate any rules (warnings, not errors)
	function checkEditWarnings() {
		const warnings = [];

		//group shifts by worker and date
		const workerShiftsByDate = {};

		editedSchedule.forEach((shift, index) => {
			if (shift.isEmpty) return;

			const key = `${shift.workerId}-${shift.date}`;
			if (!workerShiftsByDate[key]) {
				workerShiftsByDate[key] = [];
			}
			workerShiftsByDate[key].push(shift);
		});

		// Check for multiple shifts same day
		Object.entries(workerShiftsByDate).forEach(([key, shifts]) => {
			if (shifts.length > 1) {
				warnings.push({
					type: 'same-day',
					message: `${shifts[0].workerName} has multiple shifts on ${shifts[0].date}`,
					severity: 'warning'
				});
			}
		});

		//Check for Day TO Evening, Evening TO Day violations
		const workerShifts = {};
		editedSchedule.forEach((shift) => {
			if (shift.isEmpty) return;
			if (!workerShifts[shift.workerId]) {
				workerShifts[shift.workerId] = [];
			}
			workerShifts[shift.workerId].push(shift);
		});

		Object.values(workerShifts).forEach((shifts) => {
			const sorted = [...shifts].sort((a, b) => a.date.localeCompare(b.date));

			for (let i = 0; i < sorted.length - 1; i++) {
				const current = sorted[i];
				const next = sorted[i + 1];

				//Check if consecutive days >>>
				const currentDate = new Date(current.date);
				const nextDate = new Date(next.date);
				const dayDiff = (nextDate - currentDate) / (1000 * 60 * 60 * 24);

				if (dayDiff === 1) {
					if (current.shiftType === 'day' && next.shiftType === 'evening') {
						warnings.push({
							type: 'rest-rule',
							message: `${current.workerName}: Day shift on ${current.date} followed by Evening on ${next.date}`,
							severity: 'warning'
						});
					}
					if (current.shiftType === 'evening' && next.shiftType === 'day') {
						warnings.push({
							type: 'rest-rule',
							message: `${current.workerName}: Evening shift on ${current.date} followed by Day on ${next.date}`,
							severity: 'warning'
						});
					}
				}
			}
		});

		editWarnings = warnings;
	}

	//helper to format dates
	function formatDate(dateStr) {
		const date = new Date(dateStr);
		return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
	}

	//helper to format hours
	function formatHours(hours) {
		return hours === Math.floor(hours) ? hours : hours.toFixed(1);
	}

	//group schedule by date
	function groupByDate(schedule) {
		const grouped = {};
		for (const shift of schedule) {
			if (!grouped[shift.date]) {
				grouped[shift.date] = { day: [], evening: [] };
			}
			grouped[shift.date][shift.shiftType].push(shift);
		}
		return grouped;
	}

	//handle generate result
	$effect(() => {
		if (form?.generated) {
			generatedSchedule = form.generated.schedule;
			generatedStats = form.generated.stats;
			generatedWarnings = form.generated.warnings;
			scheduleStartDate = form.generated.startDate;
			scheduleEndDate = form.generated.endDate;
		}
	});
</script>

<!--IT IS RECOMMENDED THAT EACH "SECTION" IS CLOSED WHEN NOT BEING EDITED-->
<!--THIS MAKES IT MORE READABLE AND EASIER TO NAVIGATE THIS HOT PILE OF-->

<div class="mx-auto flex w-full flex-col items-center gap-1 p-4"> 
	<h1 class="mb-1 text-2xl font-semibold text-[(--fore-1)]">Admin Controls</h1>

	{#if form?.error}
		<div class="error-box">{form.error}</div>
	{/if}

	{#if form?.success && !form?.generated}
		<div class="success-box">Operation successful!</div>
	{/if}

	<!-- Workers Section -->
	<section class="py-6">
		<h2 class="mb-4 text-2xl font-semibold text-[(--fore-1)]">Workers</h2>

		<!-- ADD WORKER FORM -->
		<form
			method="POST"
			action="?/addWorker"
			use:enhance
			class="flex flex-col items-start gap-3 rounded-xl border
           border-(--main-3) bg-(--main-1)/90 p-4
           shadow-lg sm:flex-row sm:items-end"
		>
			<input
				type="text"
				name="name"
				placeholder="Worker name"
				required
				class="w-full rounded-lg border border-(--main-3) bg-(--main-2)
         px-3 py-2 text-(--fore-1) placeholder-(--fore-2)
         focus:border-(--accent-1)
         focus:ring-2 focus:ring-(--accent-1) sm:w-auto"
			/>

			<input
				type="number"
				name="hoursPerWeek"
				placeholder="Hours/week"
				min="1"
				step="0.5"
				value="40"
				required
				class="w-full rounded-lg border border-(--main-3) bg-(--main-2)
             px-3 py-2 text-(--fore-1) placeholder-(--fore-2)
             focus:border-(--accent-1)
             focus:ring-2 focus:ring-(--accent-1) sm:w-auto"
			/>

			<!-- ADD WORKER BUTTON (matches login) -->
			<button
				type="submit"
				class="relative flex cursor-pointer items-center justify-center gap-2 rounded-md
             bg-(--accent-1) px-4 py-2 text-(--fore-1)
             transition ease-in-out hover:translate-y-1 hover:scale-105 hover:opacity-80 hover:brightness-110
             focus:ring-2 focus:ring-(--accent-1) active:scale-95"
			>
				Add Worker
			</button>
		</form>

		<!-- WORKERS LIST -->
		<div class="mt-6 flex flex-col gap-4">
			{#each data.workers as worker}
				<div
					class="flex items-center justify-between rounded-md border
               border-(--main-3) bg-(--main-1) p-4
               shadow-sm"
				>
					{#if editingWorkerId === worker.id}
						<!-- EDIT MODE FORM -->
						<form
							method="POST"
							action="?/updateWorker"
							use:enhance
							class="flex w-full flex-col gap-3 sm:flex-row"
						>
							<input type="hidden" name="workerId" value={worker.id} />

							<input
								type="text"
								name="name"
								value={worker.name}
								required
								class="w-full rounded-md border border-(--main-3) bg-(--main-2)
                     px-3 py-2 text-(--fore-1) placeholder-(--fore-2)
                     focus:border-(--accent-1)
                     focus:ring-2
                     focus:ring-(--accent-1) sm:w-auto"
							/>

							<input
								type="number"
								name="hoursPerWeek"
								value={worker.hoursPerWeek}
								min="1"
								step="0.5"
								required
								class="w-full rounded-md border border-(--main-3) bg-(--main-2)
                     px-3 py-2 text-(--fore-1) placeholder-(--fore-2)
                     focus:border-(--accent-1)
                     focus:ring-2
                     focus:ring-(--accent-1) sm:w-auto"
							/>

							<!-- SAVE BUTTON -->
							<button
								type="submit"
								class="relative flex cursor-pointer items-center justify-center gap-2 rounded-md
                     bg-(--accent-1) px-4 py-2 text-(--fore-1)
                     transition ease-in-out hover:translate-y-1 hover:scale-105 hover:opacity-80 hover:brightness-110
                     focus:ring-2 focus:ring-(--accent-1) active:scale-95"
							>
								Save
							</button>

							<!-- CANCEL BUTTON -->
							<button
								type="button"
								class="relative flex cursor-pointer items-center justify-center gap-2 rounded-md
         bg-red-600 px-4 py-2 text-white
         transition ease-in-out hover:translate-y-1 hover:scale-105 hover:opacity-80
         active:scale-95"
								onclick={() => (editingWorkerId = null)}
							>
								Cancel
							</button>
						</form>
					{:else}
						<!-- DISPLAY MODE -->
						<div class="flex flex-col">
							<strong class="text-(--fore-1)">{worker.name}</strong>
							<span class="text-(--fore-2)">{worker.hoursPerWeek}h/week</span>
						</div>

						<div class="flex gap-3">
							<!-- EDIT BUTTON (matches login) -->
							<button
								class="relative flex cursor-pointer items-center justify-center gap-2 rounded-md
                     bg-(--accent-1) px-3 py-2 text-[(--fore-1)]
                     transition ease-in-out hover:translate-y-1 hover:scale-105 hover:opacity-80 hover:brightness-110
                     focus:ring-2 focus:ring-[(--accent-1)] active:scale-95"
								onclick={() => (editingWorkerId = worker.id)}
							>
								Edit
							</button>

							<!-- DELETE BUTTON -->
							<form method="POST" action="?/deleteWorker" use:enhance>
								<input type="hidden" name="workerId" value={worker.id} />
								<button
									type="submit"
									class="relative flex cursor-pointer items-center justify-center gap-2 rounded-md
                       bg-red-600 px-3 py-2 text-white
                       transition ease-in-out hover:translate-y-1 hover:scale-105
                       hover:bg-red-700 hover:opacity-90 hover:brightness-110
                       active:scale-95"
									onclick={(e) => {
										if (!confirm('Delete this worker?')) e.preventDefault();
									}}
								>
									Delete
								</button>
							</form>
						</div>
					{/if}
				</div>
			{/each}

			{#if data.workers.length === 0}
				<p class="p-4 text-center text-[(--fore-2)] italic">No workers yet. Add one above.</p>
			{/if}
		</div>
	</section>
</div>

<!-- Parameters Section -->
<section class="mx-auto flex w-full flex-col items-center gap-1 p-4">
	<h2 class="mb-1 text-2xl font-semibold text-(--fore-1)">Schedule Parameters</h2>

	<form
		method="POST"
		action="?/updateParams"
		use:enhance
		class="flex flex-col gap-6 rounded-xl border border-(--main-3)
           bg-(--main-1)/90 p-6 shadow-lg"
	>
		<!-- GRID OF INPUTS -->
		<div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
			<label class="flex flex-col gap-1 text-(--fore-1)">
				Day Shift Workers:
				<input
					type="number"
					name="workersPerDayShift"
					value={data.params.workersPerDayShift}
					min="1"
					required
					class="rounded-md border border-(--main-3) bg-(--main-2)
                 px-3 py-2 text-(--fore-1)
                 placeholder-(--fore-2)
                 focus:border-(--accent-1)
                 focus:ring-2 focus:ring-(--accent-1)"
				/>
			</label>

			<label class="flex flex-col gap-1 text-(--fore-1)">
				Evening Shift Workers:
				<input
					type="number"
					name="workersPerEveningShift"
					value={data.params.workersPerEveningShift}
					min="1"
					required
					class="rounded-md border border-(--main-3) bg-(--main-2)
                 px-3 py-2 text-(--fore-1)
                 placeholder-(--fore-2)
                 focus:border-(--accent-1)
                 focus:ring-2 focus:ring-(--accent-1)"
				/>
			</label>

			<label class="flex flex-col gap-1 text-(--fore-1)">
				Shift Duration (hours):
				<input
					type="number"
					name="shiftDurationHours"
					value={data.params.shiftDurationHours}
					min="1"
					max="12"
					step="0.5"
					required
					class="rounded-md border border-(--main-3) bg-(--main-2)
                 px-3 py-2 text-(--fore-1)
                 placeholder-(--fore-2)
                 focus:border-(--accent-1)
                 focus:ring-2 focus:ring-(--accent-1)"
				/>
			</label>

			<label class="flex flex-col gap-1 text-(--fore-1)">
				Min Partial Shift (hours):
				<input
					type="number"
					name="minPartialShiftHours"
					value={data.params.minPartialShiftHours}
					min="1"
					max="8"
					step="0.5"
					required
					class="rounded-md border border-(--main-3) bg-(--main-2)
                 px-3 py-2 text-(--fore-1)
                 placeholder-(--fore-2)
                 focus:border-(--accent-1)
                 focus:ring-2 focus:ring-(--accent-1)"
				/>
			</label>

			<label class="flex flex-col gap-1 text-(--fore-1)">
				Max Workers Per Shift:
				<input
					type="number"
					name="maxWorkersPerShift"
					value={data.params.maxWorkersPerShift}
					min="1"
					max="10"
					required
					class="rounded-md border border-(--main-3) bg-(--main-2)
                 px-3 py-2 text-(--fore-1)
                 placeholder-(--fore-2)
                 focus:border-(--accent-1)
                 focus:ring-2 focus:ring-(--accent-1)"
				/>
			</label>

			<label class="flex flex-col gap-1 text-(--fore-1)">
				Max Consecutive Days:
				<input
					type="number"
					name="maxConsecutiveDays"
					value={data.params.maxConsecutiveDays || 5}
					min="3"
					max="7"
					required
					class="rounded-md border border-(--main-3) bg-(--main-2)
                 px-3 py-2 text-(--fore-1)
                 placeholder-(--fore-2)
                 focus:border-(--accent-1)
                 focus:ring-2 focus:ring-(--accent-1)"
				/>
			</label>
		</div>

		<!-- UPDATE PARAMETERS BUTTON (matches login) -->
		<button
			type="submit"
			class="relative flex cursor-pointer items-center justify-center gap-2 rounded-md
             bg-(--accent-1) px-4 py-2 text-(--fore-1)
             transition ease-in-out
             hover:translate-y-1 hover:scale-105 hover:opacity-80 hover:brightness-110
             focus:ring-2 focus:ring-(--accent-1) active:scale-95"
		>
			Update Parameters
		</button>
	</form>
</section>

<!-- Generate Schedule Section -->
<section class="mx-auto flex w-full flex-col items-center gap-1 p-4">
	<h2 class="mb-1 text-2xl font-semibold text-(--fore-1)">Generate Schedule</h2>

	<form
		method="POST"
		action="?/generateSchedule"
		use:enhance
		class="flex flex-wrap gap-4 rounded-xl border border-(--main-3)
           bg-(--main-1)/90 p-4 shadow-lg"
	>
		<!-- START DATE -->
		<label class="flex w-full flex-col gap-1 text-(--fore-1) sm:w-auto">
			Start Date:
			<input
				type="date"
				name="startDate"
				required
				class="rounded-md border border-(--main-3)
               bg-(--main-2) px-3 py-2 text-(--fore-1)
               placeholder-(--fore-2)
               focus:border-(--accent-1)
               focus:ring-2 focus:ring-(--accent-1)"
			/>
		</label>

		<!-- END DATE -->
		<label class="flex w-full flex-col gap-1 text-(--fore-1) sm:w-auto">
			End Date:
			<input
				type="date"
				name="endDate"
				required
				class="rounded-md border border-(--main-3)
               bg-(--main-2) px-3 py-2 text-(--fore-1)
               placeholder-(--fore-2)
               focus:border-(--accent-1)
               focus:ring-2 focus:ring-(--accent-1)"
			/>
		</label>

		<!-- SUBMIT BUTTON (matching login + workers button) -->
		<button
			type="submit"
			class="relative flex cursor-pointer items-center justify-center gap-2 rounded-md
             bg-(--accent-1) px-4 py-2 text-(--fore-1)
             transition ease-in-out
             hover:translate-y-1 hover:scale-105 hover:opacity-80 hover:brightness-110
             focus:ring-2 focus:ring-(--accent-1) active:scale-95"
		>
			Generate Schedule
		</button>
	</form>
</section>

<!-- Statistics does not work on load, only when modifying or generating schedule -->
<!--Do we need this? if not we can ignore/get rid of it-->
{#if displaySchedule || displayStats}
	<section class="mx-auto flex w-full flex-col items-center gap-1">
		<h2 class="mb-1 text-xl font-semibold text-(--fore-1)">Statistics</h2>

		<div
			class="overflow-x-auto rounded-xl border border-(--main-3)
             bg-(--main-1)/90 shadow-lg"
		>
			<table class="min-w-full text-left text-sm">
				<thead class="bg-(--main-2)">
					<tr>
						<th class="px-4 py-3 font-semibold text-(--fore-1)">Worker</th>
						<th class="px-4 py-3 font-semibold text-(--fore-1)">Weekly Target</th>
						<th class="px-4 py-3 font-semibold text-(--fore-1)">Total Target</th>
						<th class="px-4 py-3 font-semibold text-(--fore-1)">Scheduled</th>
						<th class="px-4 py-3 font-semibold text-(--fore-1)">Avg/Week</th>
						<th class="px-4 py-3 font-semibold text-(--fore-1)">Remaining</th>
						<th class="px-4 py-3 font-semibold text-(--fore-1)">Day</th>
						<th class="px-4 py-3 font-semibold text-(--fore-1)">Evening</th>
						<th class="px-4 py-3 font-semibold text-(--fore-1)">Utilization</th>
					</tr>
				</thead>

				<tbody>
					{#each displayStats as stat}
						<tr
							class="even:bg-[color-mix(in_srgb,var(--main-1) 80%,black 20%)]
                     border-t border-(--main-3) text-(--fore-1)"
							class:bg-yellow-900={stat.remainingHours > 0}
						>
							<td class="px-4 py-2">{stat.workerName}</td>

							<td class="px-4 py-2">
								{formatHours(stat.targetHoursPerWeek)}h
							</td>

							<td class="px-4 py-2">
								{formatHours(stat.targetHoursTotal)}h
							</td>

							<td class="px-4 py-2">
								{formatHours(stat.scheduledHours)}h
							</td>

							<td class="px-4 py-2">
								{stat.averagePerWeek}h
							</td>

							<!-- Remaining hours: warn color when > 0 -->
							<td
								class="px-4 py-2"
								class:text-yellow-400={stat.remainingHours > 0}
								class:font-semibold={stat.remainingHours > 0}
							>
								{formatHours(stat.remainingHours)}h
							</td>

							<td class="px-4 py-2">
								{stat.dayShifts} ({formatHours(stat.dayShiftsHours)}h)
							</td>

							<td class="px-4 py-2">
								{stat.eveningShifts} ({formatHours(stat.eveningShiftsHours)}h)
							</td>

							<!-- Utilization: color-coded -->
							<td
								class="px-4 py-2 font-semibold"
								class:text-red-400={stat.utilization < 80}
								class:text-yellow-300={stat.utilization >= 80 && stat.utilization < 95}
								class:text-emerald-400={stat.utilization >= 95}
							>
								{stat.utilization}%
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	</section>
{/if}

<!-- Schedule Display -->
{#if displaySchedule}

	<div class="mx-auto flex w-full flex-col items-center gap-6 p-4">
	<section class="rounded-xl border border-(--main-3) bg-(--main-1)/90 p-6 shadow-lg">

		<!-- HEADER -->
		<div class="mb-6 flex flex-col justify-between gap-4 sm:flex-row">
			<div>
				<h2 class="text-2xl font-semibold text-(--fore-1)">
					{#if scheduleSource === 'editing'}
						Editing Schedule
					{:else if scheduleSource === 'generated'}
						Generated Schedule
					{:else if scheduleSource === 'saved'}
						Current Saved Schedule
					{/if}
				</h2>

				{#if scheduleSource === 'saved'}
					<p class="text-sm text-(--fore-2)">
						Saved on:
						{new Date(data.savedSchedule.updatedAt).toLocaleString()}
						| Date range:
						{data.savedSchedule.startDate} → {data.savedSchedule.endDate}
					</p>
				{/if}
			</div>

			<!-- ACTION BUTTONS -->
			{#if scheduleSource !== 'editing'}
				<button
					onclick={enterEditMode}
					class="relative flex cursor-pointer items-center justify-center gap-2 rounded-md
               bg-(--accent-1) px-4 py-2 text-(--fore-1)
               transition ease-in-out hover:translate-y-1 hover:scale-105 hover:opacity-80
               hover:brightness-110 focus:ring-2 focus:ring-(--accent-1) active:scale-95"
				>
					✏️ Edit Schedule
				</button>
			{:else}
				<div class="flex gap-3">
					<button
						onclick={exitEditMode}
						class="rounded-md bg-red-600 px-4 py-2 text-white
                 transition ease-in-out hover:translate-y-1 hover:scale-105
                 hover:bg-red-700 hover:opacity-90 active:scale-95"
					>
						Cancel
					</button>

					<button
						disabled={!scheduleModified}
						onclick={() => document.getElementById('save-edited-schedule').requestSubmit()}
						class="rounded-md bg-(--accent-1) px-4 py-2 text-(--fore-1)
                 transition ease-in-out
                 hover:translate-y-1 hover:scale-105 hover:opacity-80 hover:brightness-110 focus:ring-2
                 focus:ring-(--accent-1) active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
					>
						Save Changes
					</button>
				</div>
			{/if}
		</div>

		<!-- EDIT MODE WARNINGS -->
		{#if editWarnings.length > 0 && isEditMode}
			<div class="mb-6 rounded-lg border border-yellow-600/40 bg-yellow-600/10 p-4 text-yellow-300">
				<h3 class="mb-2 font-semibold">⚠️ Warnings (You can still save)</h3>
				{#each editWarnings as warning}
					<p class="py-1 text-sm">{warning.message}</p>
				{/each}
			</div>
		{/if}

		<!-- GENERATED SCHEDULE WARNINGS -->
		{#if generatedWarnings.length > 0 && scheduleSource === 'generated' && !isEditMode}
			<div class="mb-6 rounded-lg border border-yellow-600/40 bg-yellow-600/10 p-4 text-red-500">
				<h3 class="mb-2 font-semibold">⚠️ Generation Warnings</h3>
				{#each generatedWarnings as warning}
					<p class="py-1 text-sm">
						<strong>{formatDate(warning.date)} - {warning.shiftType}:</strong>
						{warning.message}
					</p>
				{/each}
			</div>
		{/if}

		<!-- CALENDAR SECTION -->
		<div>
			<h3 class="mb-8 text-xl font-semibold text-(--fore-1) p-8">Schedule Calendar</h3>

			<div
				class="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3
             2xl:grid-cols-4 p-8"
			>
				{#each Object.entries(groupByDate(displaySchedule)) as [date, shifts]}
					<div
						class="rounded-lg border border-(--main-3) bg-(--main-2)/50
                 p-4 shadow"
					>
						<h4
							class="mb-3 border-b border-(--accent-1) pb-1 text-lg font-semibold text-(--fore-1)"
						>
							{formatDate(date)}
						</h4>

						<!-- SHIFT BLOCK -->
						<div class="mb-4">
							<strong class="text-(--fore-2)">Day Shift</strong>
							{#each shifts.day as shift}
								{@const shiftIndex = displaySchedule.indexOf(shift)}

								<!-- SHIFT ITEM -->
								<div
									class="mt-2 rounded-md border-l-4 border-(--accent-1) bg-(--main-1)
                       p-2 text-(--fore-1)
                       transition"
									class:border-yellow-400={shift.isPartial}
									class:border-red-600={shift.isEmpty}
								>
									{#if isEditMode && editingShiftIndex === shiftIndex}
										<!-- EDITING -->
										<div class="flex gap-2">
											<select
												class="flex-1 rounded-md border border-(--main-3)
                             bg-(--main-2) px-3 py-1 text-(--fore-1)
                             focus:border-(--accent-1)
                             focus:ring-2 focus:ring-(--accent-1)"
												onchange={(e) => updateShift(shiftIndex, e.target.value)}
											>
												<option value="empty">-- Empty Slot --</option>
												{#each data.workers as worker}
													<option value={worker.id} selected={shift.workerId === worker.id}>
														{worker.name}
													</option>
												{/each}
											</select>

											<button
												class="rounded-md bg-(--accent-1) px-3 py-1 text-(--fore-1)
                             transition hover:scale-105 active:scale-95"
												onclick={() => (editingShiftIndex = null)}
											>
												✓
											</button>
										</div>
									{:else}
										<!-- DISPLAY -->
										<div class="flex items-center justify-between">
											<button
												type="button"
												disabled={!isEditMode}
												onclick={() => isEditMode && (editingShiftIndex = shiftIndex)}
												class="w-full text-left text-sm
                             disabled:cursor-default disabled:opacity-50"
											>
												{shift.workerName} – {formatHours(shift.hours)}h
												{#if shift.isPartial}
													<span class="ml-2 rounded bg-yellow-500/20 px-1 text-xs text-yellow-300">
														Partial
													</span>
												{/if}
												{#if shift.isEmpty}
													<span class="ml-2 rounded bg-red-600/30 px-1 text-xs text-red-400">
														Empty
													</span>
												{/if}
											</button>

											{#if isEditMode}
												<button
													onclick={() => (editingShiftIndex = shiftIndex)}
													class="ml-2 text-(--accent-1) transition hover:scale-110"
												>
													✏️
												</button>
											{/if}
										</div>
									{/if}
								</div>
							{/each}
						</div>

						<!-- EVENING SHIFT (identical behavior) -->
						<div>
							<strong class="text-(--fore-2)">Evening Shift</strong>
							{#each shifts.evening as shift}
								{@const shiftIndex = displaySchedule.indexOf(shift)}

								<div
									class="mt-2 rounded-md border-l-4 border-(--accent-1) bg-(--main-1)
                       p-2 text-(--fore-1)
                       transition"
									class:border-yellow-400={shift.isPartial}
									class:border-red-600={shift.isEmpty}
								>
									{#if isEditMode && editingShiftIndex === shiftIndex}
										<div class="flex gap-2">
											<select
												class="flex-1 rounded-md border border-(--main-3)
                             bg-(--main-2) px-3 py-1 text-(--fore-1)
                             focus:border-(--accent-1)
                             focus:ring-2 focus:ring-(--accent-1)"
												onchange={(e) => updateShift(shiftIndex, e.target.value)}
											>
												<option value="empty">-- Empty Slot --</option>
												{#each data.workers as worker}
													<option value={worker.id} selected={shift.workerId === worker.id}>
														{worker.name}
													</option>
												{/each}
											</select>

											<button
												class="rounded-md bg-(--accent-1) px-3 py-1 text-(--fore-1)
                             transition hover:scale-105 active:scale-95"
												onclick={() => (editingShiftIndex = null)}
											>
												✓
											</button>
										</div>
									{:else}
										<div class="flex items-center justify-between">
											<button
												type="button"
												disabled={!isEditMode}
												onclick={() => isEditMode && (editingShiftIndex = shiftIndex)}
												class="w-full text-left text-sm disabled:opacity-50"
											>
												{shift.workerName} – {formatHours(shift.hours)}h
												{#if shift.isPartial}
													<span class="ml-2 rounded bg-yellow-500/20 px-1 text-xs text-yellow-300">
														Partial
													</span>
												{/if}
												{#if shift.isEmpty}
													<span class="ml-2 rounded bg-red-600/30 px-1 text-xs text-red-400">
														Empty
													</span>
												{/if}
											</button>

											{#if isEditMode}
												<button
													onclick={() => (editingShiftIndex = shiftIndex)}
													class="ml-2 text-(--accent-1) transition hover:scale-110"
												>
													✏️
												</button>
											{/if}
										</div>
									{/if}
								</div>
							{/each}
						</div>
					</div>
				{/each}
			</div>
		</div>

		<!-- HIDDEN SAVE FORM -->
		{#if isEditMode && scheduleModified}
			<form method="POST" action="?/saveSchedule" use:enhance id="save-edited-schedule">
				<input
					type="hidden"
					name="startDate"
					value={scheduleStartDate || data.savedSchedule?.startDate}
				/>
				<input
					type="hidden"
					name="endDate"
					value={scheduleEndDate || data.savedSchedule?.endDate}
				/>
				<input type="hidden" name="shifts" value={JSON.stringify(editedSchedule)} />
				<input type="hidden" name="warnings" value={JSON.stringify(editWarnings)} />
			</form>
		{/if}
	</section>
	</div>
{:else}
	<section
		class="rounded-xl border border-(--main-3) bg-(--main-1)/90 p-6 text-center text-(--fore-2) italic shadow-lg"
	>
		No schedule available. Generate one above to get started.
	</section>
{/if}
