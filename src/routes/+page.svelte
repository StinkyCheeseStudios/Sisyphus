<script>
  import CalendarWeekPicker from "./CalendarWeekPicker.svelte";
  import { ArrowBigRight, ArrowBigLeft, CalendarSearch } from "lucide-svelte";
  
  const today = new Date();
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const months = {
    short: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
    long: ["January", "Febuary", "March", "April", "May", "June", 
      "July", "August", "Septemper", "October", "November", "December"]
  }
  const ariaWeeks = ["first", "second", "third", "fourth", "fifth", "sixth"]

  let isCalendarPickerOpen = $state(false);
  function toggleCalendarPicker() {
    isCalendarPickerOpen = !isCalendarPickerOpen;
  }

  // Year and month initialized as present day on first load, and functions to scroll to next or prev month.
  //  which also moves year if months are scrolled under 0 or over 12.
  let year = $state(today.getFullYear());
  let month = $state(today.getMonth());
  function prevMonth() {
    month--;
    if (month < 0) {
      month = 11;
      year--;
    }
  }
  function nextMonth() {
    month++;
    if (month > 11) {
      month = 0;
      year++;
    }
  }

  let calendar = $derived(buildCalendar(year, month)); // Auto updates when year or month changes

  // This stores which specific week the user currently has selected.
  // It is initialized to present week on first load, and it can be updated from the calendar.
  let selectedWeek = $state(initSelectedWeek());
  function setSelectedWeek(weekIndex) {
    selectedWeek = {
      year,
      month,
      weekIndex
    };
  }
  function prevWeek() {
    if (selectedWeek.weekIndex > 0) {
      selectedWeek.weekIndex--;
      return;
    }
    prevMonth();
    isCalendarPickerOpen ? setSelectedWeek(calendar.length - 1) : setSelectedWeek(calendar.length - 2);
  }
  function nextWeek() {
    if (selectedWeek.weekIndex < calendar.length - 1) {
      selectedWeek.weekIndex++;
      return;
    }
    nextMonth();
    isCalendarPickerOpen ? setSelectedWeek(0) : setSelectedWeek(1);
  }

  // This stores the nicely formatted string ("dd.mm — dd.mm") and auto-updates when selectedWeek changes.
  let weekLabel = $derived(getSelectedWeekString(selectedWeek));
    
  // This is for getting a range (mon - sun) of the week that the user selects by clicking a week in calendar.
  function getSelectedWeekRange(sel) {
    const week = buildCalendar(sel.year, sel.month)[sel.weekIndex];
    if (!week) return null;

    const mondayCell = week[0];
    const sundayCell = week[6];

    const monday = new Date(sel.year, sel.month + mondayCell.monthOffset, mondayCell.day);
    const sunday = new Date(sel.year, sel.month + sundayCell.monthOffset, sundayCell.day);

    return { monday, sunday };
  }
  // And this uses the above function to turn the week range into a nice formatted text ("dd.mm - dd.mm")
  function getSelectedWeekString(selectedWeek) {
    const { monday, sunday } = getSelectedWeekRange(selectedWeek);
    return `${formatDate(monday)} — ${formatDate(sunday)}`;
  }
  // Finds the week index (e.g. 0 = first week in month) of the current month
  function findCurrentWeekIndex() {
    const d = today.getDate();
    const m = today.getMonth();

    for (let i = 0; i < calendar.length; i++) {
      const week = calendar[i];
      for (const cell of week) {
        const cellMonth = month + cell.monthOffset;
        if (cell.day === d && cellMonth === m) {
          return i;
        }
      }
    }

    return null;
  }
  // Function for initializing selectedWeek to simply be the current week on first load.
  function initSelectedWeek() {
    return {
      year, 
      month,
      weekIndex: findCurrentWeekIndex(),
    }
  }
  // Helper to format a dates month and year as dd.mm
  function formatDate(date) {
    const d = date.getDate().toString().padStart(2, "0");
    const m = (date.getMonth() + 1).toString().padStart(2, "0");
    return `${d}.${m}`;
  }

  // Returns the number of days in a specific month
  function getDaysInMonth(y, m) {
    return new Date(y, m + 1, 0).getDate();
  }
  // Builds calendar, which is a list of objects that contain the number of the day and a monthOffset
  //  which can be used to tell which days belong to previous or next month.
  function buildCalendar(y, m) {
    const daysInCurrent = getDaysInMonth(y, m);
    const daysInPrev = getDaysInMonth(y, m - 1 < 0 ? 11 : m - 1);

    const firstWeekday = new Date(y, m, 0).getDay();
    const grid = [];
    let currentWeek = [];

    // --- 1) PREVIOUS MONTH DAYS ---
    const prevMonthDaysToShow = firstWeekday;
    const prevStart = daysInPrev - prevMonthDaysToShow + 1;
    for (let d = prevStart; d <= daysInPrev; d++) {
      currentWeek.push({ day: d, monthOffset: -1 });
    }

    // --- 2) CURRENT MONTH DAYS ---
    for (let d = 1; d <= daysInCurrent; d++) {
      currentWeek.push({ day: d, monthOffset: 0 });

      if (currentWeek.length === 7) {
        grid.push(currentWeek);
        currentWeek = [];
      }
    }

    // --- 3) NEXT MONTH DAYS ---
    let nextDay = 1;
    while (currentWeek.length < 7) {
      currentWeek.push({ day: nextDay++, monthOffset: +1 });
    }
    grid.push(currentWeek);

    return grid;
  }

  // Horror that I cooked up to display shift "boxes" in a start-/end-relative time-continuum fluster-cluck.
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

</script>

<main class="w-[95%] md:w-[85%] xl:w-[75%] min-h-full mx-auto flex justify-center pt-16">
  <div class="flex flex-col w-full gap-2 items-center">

    <!--Header with scroll buttons and date range calendar button-->
    <div 
      class="flex items-center h-12 gap-1 relative w-full transition-all duration-200
       {isCalendarPickerOpen ? 'max-w-105' : 'max-w-full'}"
    >
      {#snippet scrollWeeksButton(direction, icon, on_click)}
        <button 
          class="w-18 h-full bg-main-2 flex justify-center items-center rounded-md shrink-0 z-7
            transition-all duration-200
            hover:scale-105 hover:brightness-90
            active:scale-90 active:brightness-105"
          aria-label="Select {direction} week. Currently on 
            {ariaWeeks[selectedWeek.weekIndex]} week of {months.long[month]} {year}"
          onclick={on_click}
        >
          <icon.icon size={22} />
        </button>
      {/snippet}

      {@render scrollWeeksButton("previous", { icon: ArrowBigLeft }, prevWeek)}
      
      <button
        class="grow h-full w-full flex justify-center items-center gap-2 bg-main-2 rounded-md z-7"
        aria-label="Select previous week. Currently on 
          {ariaWeeks[selectedWeek.weekIndex]} week of {months.long[month]} {year}"
        onclick={() => { toggleCalendarPicker() }}
      >
        <CalendarSearch size={22} />
        {weekLabel}
      </button>

      <!--Calendar picker element that pops up on click of this button above-->
      {#if isCalendarPickerOpen}
        <CalendarWeekPicker 
          {toggleCalendarPicker} 
          {prevMonth} 
          {nextMonth} 
          {setSelectedWeek}
          {days} 
          {months}
          {calendar} 
          {selectedWeek} 
          {month} 
          {year}
          {ariaWeeks}
        />
      {/if}

      {@render scrollWeeksButton("next", { icon: ArrowBigRight }, nextWeek)}
    </div>

    <!--Days of week-->
    <div class="w-full flex flex-col gap-1 relative">

      <!--Each weekdays cards/segments-->
      {#each days as day, i}
        <div class="w-full h-16 bg-main-2 rounded-md flex items-center p-1.5 overflow-hidden relative">
          <!--Top left bit that contains day (Mon, Tue, Wed, etc.)-->
          <div class="h-6 w-12 bg-main/70 flex justify-center items-center rounded-br-md absolute top-0 left-0 z-2
            shadow-[0_0_5px_2px] shadow-black/40"
          >
            <span>{day}</span>
            <!--Fake internal border radius elements-->
            <div class="overflow-hidden absolute bottom-0 left-0 translate-y-full">
              <div
                class="bg-transparent w-4 aspect-square rounded-md shadow-[-4px_-4px] shadow-main/70 pointer-events-none"
                aria-hidden="true"
              ></div>
            </div>
            <div class="overflow-hidden absolute top-0 right-0 translate-x-full">
              <div
                class="bg-transparent w-4 aspect-square rounded-md shadow-[-4px_-4px] shadow-main/70 pointer-events-none"
                aria-hidden="true"
              ></div>
            </div>
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
</main>