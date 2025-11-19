<script>
  import { ArrowBigRight, ArrowBigLeft, CalendarSearch } from "lucide-svelte";

  const days = [
    "Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"
  ];

  let earliest_start = $state(8);
  let latest_end = $state(20.5);
  let diff = $derived(latest_end - earliest_start);
  let shifts = $state([
    { start: 8, end: 16, text_start: "8:00", text_end: "16:00" },
    { start: 12, end: 20, text_start: "12:00", text_end: "20:00" },
    { start: 10.5, end: 16.5, text_start: "10:30", text_end: "16:30" },
    { start: 10.5, end: 16.5, text_start: "10:30", text_end: "16:30" },
    { start: 12, end: 20, text_start: "12:00", text_end: "20:00" },
    { start: 12, end: 20, text_start: "12:00", text_end: "20:00" },
    { start: 8, end: 16, text_start: "8:00", text_end: "16:00" },
  ]);
  let start_percentages = $derived(
    shifts.map(shift => ({
      start: Math.round((shift.start - earliest_start) / diff * 100),
      end: Math.round((shift.end - earliest_start) / diff * 100)
    }))
  );
  $inspect(start_percentages);
</script>

<div class="w-[95%] md:w-[85%] xl:w-[75%] min-h-full mx-auto flex justify-center pt-16">
  <div class="flex flex-col w-full gap-2">

    <!--Header with scroll buttons and date range-->
    <div class="flex items-center h-12 gap-1">
      <button class="w-18 h-full bg-main-2 flex justify-center items-center rounded-md shrink-0">
        <ArrowBigLeft size={22} />
      </button>
      <button class="grow h-full flex justify-center items-center gap-2 bg-main-2 rounded-md">
        <CalendarSearch size={22} />
        18.11 — 25.11
      </button>
      <button class="w-18 h-full bg-main-2 flex justify-center items-center rounded-md shrink-0">
        <ArrowBigRight size={22} />
      </button>
    </div>

    <!--Days of week-->
    <div class="w-full flex flex-col gap-1 relative">

      <!--Each weekdays cards/segments-->
      {#each days as day, i}
        <div class="w-full h-16 bg-main-2 rounded-md flex items-center p-1.5 overflow-hidden relative">
          <!--Top left bit that contains day (Mon, Tue, Wed, etc.)-->
          <div class="h-6 w-12 bg-main flex justify-center items-center rounded-br-md absolute top-0 left-0 z-2
            shadow-[0_0_5px_2px] shadow-black/40"
          >
            <span>{day}</span>
            <!--Fake internal border radius elements-->
            <div 
              class="absolute bg-transparent w-4 aspect-square bottom-0 left-0 translate-y-full rounded-md 
                shadow-[-4px_-4px_var(--main-1)] pointer-events-none"
              aria-hidden="true"
            ></div>
            <div 
              class="absolute bg-transparent w-4 aspect-square top-0 right-0 translate-x-full rounded-md 
                shadow-[-4px_-4px_var(--main-1)] pointer-events-none"
              aria-hidden="true"
            ></div>
          </div>

          <div 
            class="relative h-full flex justify-center items-center"
            style="left: {start_percentages[i].start}%; width: {start_percentages[i].end - start_percentages[i].start}%"
          >
            <span>{shifts[i].text_start}-{shifts[i].text_end}</span>
            <div class="absolute inset-0 rounded-xl shadow-[inset_0_0_20px_2px_var(--accent-1)] pointer-events-none"></div>
          </div>
        </div>
      {/each}

    </div>

  </div>
</div>