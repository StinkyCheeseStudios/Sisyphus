<script>
  import { page } from "$app/state";
</script>

<div class="h-full flex flex-col justify-center items-center gap-3">
  <h1 class="text-3xl text-error font-bold">ERROR</h1>
  <h2 class="text-2xl">{page.status} — {page.error.message}</h2>
</div>