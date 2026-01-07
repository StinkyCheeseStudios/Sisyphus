<script>
  import { SquarePen, Trash2, Plus, Minus, Save, Copy, Check, RefreshCw } from "lucide-svelte";
	import { fade, scale, slide } from "svelte/transition";
  import { enhance } from "$app/forms";
  import EmployeeCard from "./EmployeeCard.svelte";

  let { data, form } = $props();

  let addedEmployees = $state([]);
  //$inspect(addedEmployees);

  let newEmployeeInput = $state({
    name: "",
    hours: 50,
    code: shortCode()
  });

  let copied = $state([false]);

  function handleCopy(code, i) {
    navigator.clipboard.writeText(code);
    copied[i] = true;

    setTimeout(() => {
      copied[i] = false;
    }, 2500)
  }

  function shortCode(length = 6) {
    const chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let result = '';
    const bytes = crypto.getRandomValues(new Uint8Array(length));
    for (let b of bytes) result += chars[b % chars.length];
    return result;
  }

  $effect(() => {
    if (form?.addedEmployees) {
      addedEmployees = form.addedEmployees;

      newEmployeeInput = {
        name: "",
        hours: 50,
        code: shortCode()
      }

      copied = Array(form.addedEmployees.length).fill(false);
    }
  });
</script>


<main class="h-full py-14 flex flex-col justify-center w-9/10 sm:w-8/10 lg:w-7/10 xl:w-220 mx-auto gap-4">
  <div class="w-full bg-main-2 p-4 rounded-md flex flex-col gap-4">
    <h1 class="text-xl font-semibold">Employees</h1>

    <div
      class="grid auto-rows-auto gap-4
        grid-cols-[repeat(auto-fit,minmax(16rem,1fr))] sm:grid-cols-[repeat(auto-fit,minmax(22rem,1fr))]"
    >
      {#each data.workers as worker}
        <EmployeeCard {worker} {handleCopy} />
      {/each}
    </div>

  </div>

  <form 
    use:enhance
    method="POST"
    action="?/createEmployee"
    class="w-full bg-main-2 p-4 rounded-md flex flex-col gap-2"
  >

    <h1 class="text-xl font-semibold">Add new employees</h1>

    {#each addedEmployees as employee, i}
      <div class="w-full flex flex-col md:flex-row gap-1">

        <div class="flex flex-col gap-1">
          {#if i === 0}
            <label
              for="addedEmployeesName"
              id="addedEmployeesNameLabel"
              class="text-sm text-fore-2 bg-main-3 w-min text-nowrap px-2 rounded-md"
            >
              Employee name
            </label>
          {/if}
          <input
            autocomplete="off"
            type="text"
            name="addedEmployeesName"
            id="addedEmployeesNameInput"
            class="bg-main-3 border border-main-4 rounded-md focus:ring-accent h-12"
            bind:value={addedEmployees[i].name}
            readonly
          >
        </div>
        <div class="flex grow flex-col gap-1">
          {#if i === 0}
            <label
              for="addedEmployeesHours"
              id="addedEmployeesHoursLabel"
              class="text-sm text-fore-2 bg-main-3 w-min text-nowrap px-2 rounded-md"
            >
              Hours/week
            </label>
          {/if}
          <div class="flex gap-1">
            <!--Number scroller input-->
            <div
              class="flex justify-between items-center bg-main-3 border border-main-4 rounded-md h-12 overflow-hidden
                [&:has(input:focus)]:border-accent w-38 shrink-0"
            >
              <button
                type="button"
                onclick={() => { addedEmployees[i].hours-- }}
                class="flex justify-center items-center h-full aspect-square hover:bg-main-4 text-fore-2"
                disabled
              >
                <Minus size={22} />
              </button>
              <input
                type="number"
                name="addedEmployeesHours"
                id="addedEmployeesHoursInput"
                class="bg-transparent border-none ring-0 rounded-md w-full text-center"
                bind:value={addedEmployees[i].hours}
                readonly
              >
              <button
                type="button"
                onclick={() => { addedEmployees[i].hours++ }}
                class="flex justify-center items-center h-full aspect-square hover:bg-main-4 text-fore-2"
                disabled
              >
                <Plus size={22} />
              </button>
            </div>

            <div
              transition:slide={{ axis: "x" }}
              class="h-full w-full flex justify-between items-center bg-main-3 border border-main-4 rounded-md p-1"
            >
              <span class="ml-3">{addedEmployees[i].code}</span>
              <button
                type="button"
                onclick={() => { handleCopy(addedEmployees[i].code, i) }}
                class="ml-auto h-full aspect-square rounded-md hover:bg-main-4 flex justify-center items-center
                  active:scale-90 transition-all duration-25 relative"
              >
                {#if copied[i]}
                  <div
                    in:scale={{ delay: 500, duration: 500 }}
                    out:scale={{ duration: 500 }}
                    class="absolute top-1/2 left-1/2 -translate-1/2"
                  >
                    <Check size={20} />
                  </div>
                {:else}
                  <div
                    in:scale={{ delay: 500, duration: 500 }}
                    out:scale={{ duration: 500 }}
                    class="absolute top-1/2 left-1/2 -translate-1/2"
                  >
                    <Copy size={20} />
                  </div>
                {/if}
              </button>
            </div>

            <!--Submit button — in the same row as number input-->
            <button
              type="button"
              class="flex justify-center items-center h-12 w-12 text-main rounded-md relative
                shrink-0 {form?.creationSuccess ? 'bg-success' : 'bg-accent'} transition-colors duration-350"
              disabled
            >
              <Save size={22} />
              <div
                transition:scale={{ duration: 1000 }}
                class="absolute rounded-full p-0.5 bg-success text-main top-4 left-3.5 z-5 -translate-1/2"
              >
                <Check size={14} />
              </div>
            </button>
          </div>
        </div>

      </div>

      <input 
        hidden 
        type="text" 
        value={addedEmployees[i].code}
        name="addedEmployeesCode"
        id="addedEmployeesCodeInput"
      >
    {/each}

    
    <!--==============================================-->
    <!-- ACTUAL NEW EMPLOYEE INPUT -->
    <!--==============================================-->
    <div class="mt-2 w-full flex flex-col md:flex-row gap-1">

      <div class="flex flex-col gap-1">
        {#if addedEmployees.length === 0}
          <label
            for="name"
            id="nameLabel"
            class="text-sm text-fore-2 bg-main-3 w-min text-nowrap px-2 rounded-md"
          >
            Employee name
          </label>
        {/if}

        <input
          autocomplete="off"
          type="text"
          name="name"
          id="nameInput"
          class="bg-main-3 border border-main-4 rounded-md focus:ring-accent h-12"
          bind:value={newEmployeeInput.name}
        >
      </div>
      <div class="flex grow flex-col gap-1">
        {#if addedEmployees.length === 0}
          <label
            for="hours" 
            id="hoursLabel"
            class="text-sm text-fore-2 bg-main-3 w-min text-nowrap px-2 rounded-md"
          >
            Hours/week
          </label>
        {/if}

        <div class="flex gap-1">
          <!--Number scroller input-->
          <div
            class="flex justify-between items-center bg-main-3 border border-main-4 rounded-md h-12 overflow-hidden
              [&:has(input:focus)]:border-accent w-38 shrink-0"
          >
            <button
              type="button"
              onclick={() => { newEmployeeInput.hours-- }}
              class="flex justify-center items-center h-full aspect-square hover:bg-main-4"
            >
              <Minus size={22} />
            </button>
            <input
              type="number"
              name="hours"
              id="hoursInput"
              class="bg-transparent border-none ring-0 rounded-md w-full text-center"
              bind:value={newEmployeeInput.hours}
            >
            <button
              type="button"
              onclick={() => { newEmployeeInput.hours++ }}
              class="flex justify-center items-center h-full aspect-square hover:bg-main-4"
            >
              <Plus size={22} />
            </button>
          </div>

          <!--Submit button — in the same row as number input-->
          <button
            type="submit"
            class="flex justify-center items-center h-12 w-12 text-main rounded-md relative
              shrink-0 bg-accent"
          >
            <Save size={22} />
          </button>
        </div>
      </div>

    </div>

    <input 
      hidden 
      type="text" 
      value={newEmployeeInput.code}
      name="code"
      id="codeInput"
    >
  </form>

</main>


<style>
  input[type="number"] {
    -moz-appearance: textfield; /* Removes arrows in Firefox */
  }

  input[type="number"]::-webkit-inner-spin-button,
  input[type="number"]::-webkit-outer-spin-button {
    -webkit-appearance: none;  /* Removes arrows in Chrome/Safari/Edge */
    margin: 0;
  }
</style>