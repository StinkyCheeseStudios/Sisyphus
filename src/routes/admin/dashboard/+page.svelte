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
    isEditMode ? editedSchedule :
    generatedSchedule ? generatedSchedule :
    data.savedSchedule?.shifts || null
  );
  
  let displayStats = $derived(
    generatedStats.length > 0 ? generatedStats : null
  );
  
  //Track where schedule came from
  let scheduleSource = $derived(
    isEditMode ? 'editing' :
    generatedSchedule ? 'generated' :
    data.savedSchedule ? 'saved' :
    null
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


	function exitEditMode(){
		isEditMode = false;
		editedSchedule = null;
		editingShiftIndex = null;
		scheduleModified = false;
		editWarnings = [];
	}

	//update specific shift
	function updateShift(index, newWorkerId){
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
      const worker = data.workers.find(w => w.id === newWorkerId);
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
    editedSchedule.forEach(shift => {
      if (shift.isEmpty) return;
      if (!workerShifts[shift.workerId]) {
        workerShifts[shift.workerId] = [];
      }
      workerShifts[shift.workerId].push(shift);
    });
    
    Object.values(workerShifts).forEach(shifts => {
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


<div class="container">
	<h1>Scheduler Admin Page Thingy</h1>

	{#if form?.error}
		<div class="error-box">{form.error}</div>
	{/if}

	{#if form?.success && !form?.generated}
		<div class="success-box">Operation successful!</div>
	{/if}

	<!-- Workers Section -->
	<section class="section">
		<h2>Workers</h2>
		<form method="POST" action="?/addWorker" use:enhance class="form-inline">
			<input type="text" name="name" placeholder="Worker name" required />
			<input
				type="number"
				name="hoursPerWeek"
				placeholder="Hours/week"
				min="1"
				step="0.5"
				value="40"
				required
			/>
			<button type="submit">Add Worker</button>
		</form>

		<div class="workers-list">
			{#each data.workers as worker}
				<div class="worker-card">
					{#if editingWorkerId === worker.id}
						<form method="POST" action="?/updateWorker" use:enhance class="form-inline">
							<input type="hidden" name="workerId" value={worker.id} />
							<input type="text" name="name" value={worker.name} required />
							<input
								type="number"
								name="hoursPerWeek"
								value={worker.hoursPerWeek}
								min="1"
								step="0.5"
								required
							/>
							<button type="submit">Save</button>
							<button type="button" onclick={() => (editingWorkerId = null)}>Cancel</button>
						</form>
					{:else}
						<div class="worker-info">
							<strong>{worker.name}</strong>
							<span>{worker.hoursPerWeek}h/week</span>
						</div>
						<div class="worker-actions">
							<button onclick={() => (editingWorkerId = worker.id)}>Edit</button>
							<form method="POST" action="?/deleteWorker" use:enhance style="display: inline;">
								<input type="hidden" name="workerId" value={worker.id} />
								<button
									type="submit"
									class="btn-delete"
									onclick={(e) => {
										if (!confirm('Delete this worker?')) e.preventDefault();
									}}>Delete</button
								>
							</form>
						</div>
					{/if}
				</div>
			{/each}

			{#if data.workers.length === 0}
				<p class="empty-state">No workers yet. Add one above.</p>
			{/if}
		</div>
	</section>

	

	<!-- Parameters Section -->
	<section class="section">
		<h2>Schedule Parameters</h2>

		<form method="POST" action="?/updateParams" use:enhance class="params-form">
			<div class="param-grid">
				<label>
					Day Shift Workers:
					<input
						type="number"
						name="workersPerDayShift"
						value={data.params.workersPerDayShift}
						min="1"
						required
					/>
				</label>

				<label>
					Evening Shift Workers:
					<input
						type="number"
						name="workersPerEveningShift"
						value={data.params.workersPerEveningShift}
						min="1"
						required
					/>
				</label>

				<label>
					Shift Duration (hours):
					<input
						type="number"
						name="shiftDurationHours"
						value={data.params.shiftDurationHours}
						min="1"
						max="12"
						step="0.5"
						required
					/>
				</label>

				<label>
					Min Partial Shift (hours):
					<input
						type="number"
						name="minPartialShiftHours"
						value={data.params.minPartialShiftHours}
						min="1"
						max="8"
						step="0.5"
						required
					/>
				</label>

				<label>
					Max Workers Per Shift:
					<input
						type="number"
						name="maxWorkersPerShift"
						value={data.params.maxWorkersPerShift}
						min="1"
						max="10"
						required
					/>
				</label>
			</div>

			<button type="submit">Update Parameters</button>
		</form>
	</section>

	



	<!-- Generate Schedule Section -->
	<section class="section">
		<h2>Generate Schedule</h2>

		<form method="POST" action="?/generateSchedule" use:enhance class="form-inline">
			<label>
				Start Date:
				<input type="date" name="startDate" required />
			</label>

			<label>
				End Date:
				<input type="date" name="endDate" required />
			</label>

			<button type="submit" class="btn-primary">Generate Schedule</button>
		</form>
	</section>

	
	    <!-- Statistics does not work on load, only when modifying or generating schedule -->
		<!--Do we need this? if not we can ignore/get rid of it-->
		{#if displaySchedule || displayStats}
		<div class="stats-section">
		  <h3>Statistics</h3>
		  <table class="stats-table">
			<thead>
			  <tr>
				<th>Worker</th>
				<th>Target</th>
				<th>Scheduled</th>
				<th>Remaining</th>
				<th>Day</th>
				<th>Evening</th>
				<th>Utilization</th>
			  </tr>
			</thead>
			<tbody>
			  {#each displayStats as stat}
				<tr class:under-scheduled={stat.remainingHours > 0}>
				  <td>{stat.workerName}</td>
				  <td>{formatHours(stat.targetHours)}h</td>
				  <td>{formatHours(stat.scheduledHours)}h</td>
				  <td class:warning-text={stat.remainingHours > 0}>{formatHours(stat.remainingHours)}h</td>
				  <td>{stat.dayShifts} ({formatHours(stat.dayShiftsHours)}h)</td>
				  <td>{stat.eveningShifts} ({formatHours(stat.eveningShiftsHours)}h)</td>
				  <td>{stat.utilization}%</td>
				</tr>
			  {/each}
			</tbody>
		  </table>
		</div>
	  {/if}

	<!-- Schedule Display -->
{#if displaySchedule}
  <section class="section">
    <div class="section-header">
      <div>
        <h2>
          {#if scheduleSource === 'editing'}
            Editing Schedule
          {:else if scheduleSource === 'generated'}
            Generated Schedule
          {:else if scheduleSource === 'saved'}
            Current Saved Schedule
          {/if}
        </h2>
        
        {#if scheduleSource === 'saved'}
          <p class="schedule-meta">
            Saved on: {new Date(data.savedSchedule.updatedAt).toLocaleString()} | 
            Date range: {data.savedSchedule.startDate} to {data.savedSchedule.endDate}
          </p>
        {/if}
      </div>
      
      {#if scheduleSource !== 'editing'}
        <button class="btn-edit" onclick={enterEditMode}>
          ✏️ Edit Schedule
        </button>
      {:else}
        <div class="edit-actions">
          <button class="btn-cancel" onclick={exitEditMode}>Cancel</button>
          <button 
            class="btn-save" 
            disabled={!scheduleModified}
            onclick={() => {
              document.getElementById('save-edited-schedule').requestSubmit();
            }}
          >
            Save Changes
          </button>
        </div>
      {/if}
    </div>
    
    <!-- Warnings (only in edit mode) -->
    {#if editWarnings.length > 0 && isEditMode}
      <div class="warnings-box">
        <h3>⚠️ Warnings (You can still save)</h3>
        {#each editWarnings as warning}
          <div class="warning-item">{warning.message}</div>
        {/each}
      </div>
    {/if}
    
    <!-- Generated schedule warnings (only for newly generated) -->
    {#if generatedWarnings.length > 0 && scheduleSource === 'generated' && !isEditMode}
      <div class="warnings-box">
        <h3>⚠️ Generation Warnings</h3>
        {#each generatedWarnings as warning}
          <div class="warning-item">
            <strong>{formatDate(warning.date)} - {warning.shiftType}:</strong> {warning.message}
          </div>
        {/each}
      </div>
    {/if}
    
    
    <!-- THE CALENDAR GRID -->
    <div class="calendar-section">
      <h3>Schedule Calendar</h3>
      <div class="calendar-grid">
        {#each Object.entries(groupByDate(displaySchedule)) as [date, shifts]}
          <div class="day-card">
            <h4>{formatDate(date)}</h4>
            
            <!-- Day Shifts -->
            <div class="shift-group">
              <strong>Day Shift</strong>
              {#each shifts.day as shift}
                {@const shiftIndex = displaySchedule.indexOf(shift)}
                
                <div 
                  class="shift-item" 
                  class:editable={isEditMode}
                  class:empty={shift.isEmpty} 
                  class:partial={shift.isPartial}
                >
                  {#if isEditMode && editingShiftIndex === shiftIndex}
                    <!-- EDITING THIS SHIFT -->
                    <select 
                      class="worker-select"
                      onchange={(e) => updateShift(shiftIndex, e.target.value)}
                    >
                      <option value="empty">-- Empty Slot --</option>
                      {#each data.workers as worker}
                        <option 
                          value={worker.id}
                          selected={shift.workerId === worker.id}
                        >
                          {worker.name}
                        </option>
                      {/each}
                    </select>
                    <button 
                      class="btn-small"
                      onclick={() => editingShiftIndex = null}
                    >
                      ✓
                    </button>
                  {:else}
                    <button
  type="button"
  class="shift-content"
  class:clickable={isEditMode}
  onclick={() => isEditMode && (editingShiftIndex = shiftIndex)}
  disabled={!isEditMode}
>
  {shift.workerName} - {formatHours(shift.hours)}h
  {#if shift.isPartial}<span class="badge">Partial</span>{/if}
  {#if shift.isEmpty}<span class="badge empty">Empty</span>{/if}
</button>
                    {#if isEditMode}
                      <button 
                        class="btn-edit-small"
                        onclick={() => editingShiftIndex = shiftIndex}
                      >
                        ✏️
                      </button>
                    {/if}
                  {/if}
                </div>
              {/each}
            </div>
            
            <!-- Evening Shifts -->
            <div class="shift-group">
              <strong>Evening Shift</strong>
              {#each shifts.evening as shift}
                {@const shiftIndex = displaySchedule.indexOf(shift)}
                
                <div 
                  class="shift-item" 
                  class:editable={isEditMode}
                  class:empty={shift.isEmpty} 
                  class:partial={shift.isPartial}
                >
                  {#if isEditMode && editingShiftIndex === shiftIndex}
                    <select 
                      class="worker-select"
                      onchange={(e) => updateShift(shiftIndex, e.target.value)}
                    >
                      <option value="empty">-- Empty Slot --</option>
                      {#each data.workers as worker}
                        <option 
                          value={worker.id}
                          selected={shift.workerId === worker.id}
                        >
                          {worker.name}
                        </option>
                      {/each}
                    </select>
                    <button 
                      class="btn-small"
                      onclick={() => editingShiftIndex = null}
                    >
                      ✓
                    </button>
                  {:else}
                    <button
					type ="button"
                      class="shift-content"
                      class:clickable={isEditMode}
                      onclick={() => isEditMode && (editingShiftIndex = shiftIndex)}
                    >
                      {shift.workerName} - {formatHours(shift.hours)}h
                      {#if shift.isPartial}<span class="badge">Partial</span>{/if}
                      {#if shift.isEmpty}<span class="badge empty">Empty</span>{/if}
				</button>
                    {#if isEditMode}
                      <button 
                        class="btn-edit-small"
                        onclick={() => editingShiftIndex = shiftIndex}
                      >
                        ✏️
                      </button>
                    {/if}
                  {/if}
                </div>
              {/each}
            </div>
          </div>
        {/each}
      </div>
    </div>
    
    <!-- Hidden save form -->
    {#if isEditMode && scheduleModified}
      <form method="POST" action="?/saveSchedule" use:enhance id="save-edited-schedule">
        <input type="hidden" name="startDate" value={scheduleStartDate || data.savedSchedule?.startDate} />
        <input type="hidden" name="endDate" value={scheduleEndDate || data.savedSchedule?.endDate} />
        <input type="hidden" name="shifts" value={JSON.stringify(editedSchedule)} />
        <input type="hidden" name="warnings" value={JSON.stringify(editWarnings)} />
      </form>
    {/if}
  </section>
{:else}
  <section class="section">
    <p class="empty-state">No schedule available. Generate one above to get started.</p>
  </section>
{/if}
</div>









<!--THIS IS JUST PALCE HOLDER STYLING, THIS SHOULD BE DELETED WHEN TAILWIND STYLING IS BEING IMPLEMENTED-->
<style>
	.container {
		max-width: 1200px;
		margin: 0 auto;
		padding: 2rem;
	}

	h1 {
		font-size: 2rem;
		margin-bottom: 2rem;
	}
	h2 {
		font-size: 1.5rem;
		margin-top: 0;
	}
	h3 {
		font-size: 1.2rem;
	}

	.section {
		background: white;
		padding: 1.5rem;
		margin-bottom: 1.5rem;
		border-radius: 8px;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
	}

	.error-box {
		background: #fee;
		border: 1px solid #fcc;
		padding: 1rem;
		margin-bottom: 1rem;
		border-radius: 4px;
		color: #c00;
	}

	.success-box {
		background: #efe;
		border: 1px solid #cfc;
		padding: 1rem;
		margin-bottom: 1rem;
		border-radius: 4px;
		color: #060;
	}

	.form-inline {
		display: flex;
		gap: 0.5rem;
		flex-wrap: wrap;
		margin-bottom: 1rem;
	}

	input,
	button {
		padding: 0.5rem;
		border: 1px solid #ddd;
		border-radius: 4px;
		font-size: 1rem;
	}

	button {
		background: #007bff;
		color: white;
		border: none;
		cursor: pointer;
	}

	button:hover {
		background: #0056b3;
	}

	.btn-primary {
		background: #28a745;
		padding: 0.75rem 1.5rem;
	}

	.btn-primary:hover {
		background: #218838;
	}

	.btn-delete {
		background: #dc3545;
	}

	.btn-delete:hover {
		background: #c82333;
	}

	.btn-save {
		background: #17a2b8;
		padding: 0.75rem 1.5rem;
		margin-top: 1rem;
	}

	.btn-save:hover {
		background: #138496;
	}

	.workers-list {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.worker-card {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 1rem;
		background: #f8f9fa;
		border-radius: 4px;
	}

	.worker-info {
		display: flex;
		gap: 1rem;
		align-items: center;
	}

	.worker-actions {
		display: flex;
		gap: 0.5rem;
	}

	.params-form .param-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
		gap: 1rem;
		margin-bottom: 1rem;
	}

	label {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
		font-weight: 500;
	}

	.warnings-box {
		background: #fff3cd;
		border: 1px solid #ffc107;
		padding: 1rem;
		margin-bottom: 1rem;
		border-radius: 4px;
	}

	.warning-item {
		padding: 0.5rem 0;
	}

	.stats-table {
		width: 100%;
		border-collapse: collapse;
		margin: 1rem 0;
	}

	.stats-table th,
	.stats-table td {
		padding: 0.75rem;
		text-align: left;
		border-bottom: 1px solid #ddd;
	}

	.stats-table th {
		background: #f8f9fa;
		font-weight: 600;
	}

	.under-scheduled {
		background: #fff3cd;
	}

	.warning-text {
		color: #856404;
		font-weight: bold;
	}

	.calendar-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
		gap: 1rem;
		margin-top: 1rem;
	}

	.day-card {
		background: #f8f9fa;
		padding: 1rem;
		border-radius: 8px;
		border: 2px solid #e9ecef;
	}

	.day-card h4 {
		margin: 0 0 1rem 0;
		padding-bottom: 0.5rem;
		border-bottom: 2px solid #007bff;
	}

	.shift-group {
		margin-bottom: 1rem;
	}

	.shift-group strong {
		display: block;
		margin-bottom: 0.5rem;
		color: #6c757d;
		font-size: 0.9rem;
	}

	.shift-item {
		padding: 0.5rem;
		background: white;
		margin-bottom: 0.25rem;
		border-radius: 4px;
		border-left: 3px solid #007bff;
	}

	.shift-item.partial {
		border-left-color: #ffc107;
		background: #fffbf0;
	}

	.shift-item.empty {
		border-left-color: #dc3545;
		background: #fff5f5;
		color: #dc3545;
		font-style: italic;
	}

	.badge {
		display: inline-block;
		padding: 0.2rem 0.4rem;
		font-size: 0.75rem;
		background: #ffc107;
		color: #000;
		border-radius: 3px;
		margin-left: 0.5rem;
	}

	.badge.empty {
		background: #dc3545;
		color: white;
	}

	.empty-state {
		color: #6c757d;
		font-style: italic;
		padding: 1rem;
		text-align: center;
	}

</style>
