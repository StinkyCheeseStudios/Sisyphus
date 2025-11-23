<script>
  import { ChevronRight, ChevronLeft } from "lucide-svelte";
  import { fade } from "svelte/transition";
  let { 
    toggleCalendarPicker, 
    prevMonth, 
    nextMonth, 
    setSelectedWeek,
    days, 
    months, 
    calendar, 
    selectedWeek, 
    month, 
    year,
    ariaWeeks
  } = $props();
</script>


<div 
  class="absolute z-5 -translate-x-1/2 translate-y-full left-1/2 -bottom-1 w-full max-w-105 bg-main-2 rounded-md 
    p-1 flex flex-col gap-1"
  transition:fade={{ duration: 200 }}
>
  <div class="flex justify-between items-center">
    <button 
      class="flex justify-center items-center h-8 aspect-square bg-main-3 rounded-md hover:bg-main-4"
      aria-label="Move calendar to previous month. Currently on {months.long[month]} of {year}."
      onclick={prevMonth}
    >
      <ChevronLeft size={20} />
    </button>
    <div class="flex justify-center gap-2 font-semibold">
      <span>{months.long[month]}</span>
      <span>{year}</span>
    </div>
    <button 
      class="flex justify-center items-center h-8 aspect-square bg-main-3 rounded-md hover:bg-main-4"
      aria-label="Move calendar to next month. Currently on {months.long[month]} of {year}."
      onclick={nextMonth}
    >
      <ChevronRight size={20} />
    </button>
  </div>

  <div class="border border-main-3 rounded-md py-2 px-1">
    <!--Each day (Mon, Tue...) on the top-->
    <div class="grid grid-cols-7 text-center text-sm font-medium text-fore-2 mb-1 px-1">
      {#each days as day}
        <span>{day}</span>
      {/each}
    </div>
    <!--Each week as a grid of seven columns in a flex-col container-->
    <div class="flex flex-col relative">
      {#each calendar as week, weekIndex}
        <button 
          class="grid grid-cols-7 rounded-md hover:font-semibold transition-all duration-250 group relative"
          aria-label="Select the {ariaWeeks[weekIndex]} week of {months.long[month]} {year}"
          onclick={() => { setSelectedWeek(weekIndex) }}
        >
          {#each week as day}

            <div 
              class="h-8 flex justify-center items-center 
                {day.monthOffset === 0 ? 'text-fore-1' : 'text-fore-3 font-light'}"
            >
              {day.day ?? ""}
            </div>

            <!--"Outset" hover effect on group-hover-->
            <div
              class="absolute -top-1 -bottom-1 left-0 w-full rounded-md group-hover:bg-main/10 -z-1"
            ></div>

            <!--Selected week indicator-->
            {#if (selectedWeek.weekIndex === weekIndex && selectedWeek.month === month && selectedWeek.year === year)}
              <div
                class="absolute left-1 right-1 h-full top-0 rounded-md bg-main-3/80 border border-main-4 -z-2"
                in:fade={{ duration: 300 }}
              ></div>
            {/if}

          {/each}
        </button>
      {/each}
    </div>
  </div>

</div>

<!--Fixed screen overlay under calendar when calendar is open-->
<div 
  class="fixed inset-0 bg-black/35 backdrop-blur-xs z-4"
  onclick={toggleCalendarPicker}
  aria-hidden="true"
  transition:fade={{ duration: 200 }}
></div>