<form class="max-w-md mx-auto my-24 p-6 rounded-xl shadow-lg flex flex-col gap-4 bg-[color:var(--main-1)]/90 dark:bg-[color:var(--main-2)]/90" on:submit|preventDefault>
  <h1 class="text-center text-lg font-semibold text-[color:var(--fore-1)]">Sign in</h1>

  <div class="field flex flex-col gap-2">
    <label for="username" class="text-sm text-[color:var(--fore-2)] text-center w-48 mx-auto">Username</label>
    <input
      id="username"
      name="username"
      type="text"
      autocomplete="username"
      class="form-input w-48 mx-auto px-3 py-2 rounded-md border border-[color:var(--main-3)] bg-[color:var(--main-2)] text-[color:var(--fore-1)] focus:ring-2 focus:ring-[color:var(--accent-1)] focus:border-[color:var(--accent-1)]"
    />
  </div>

  <div class="field flex flex-col gap-2">
    <label for="password" class="text-sm text-[color:var(--fore-2)] text-center w-48 mx-auto">Password</label>
    <input
      id="password"
      name="password"
      type="password"
      autocomplete="current-password"
      class="form-input w-48 mx-auto px-3 py-2 rounded-md border border-[color:var(--main-3)] bg-[color:var(--main-2)] text-[color:var(--fore-1)] focus:ring-2 focus:ring-[color:var(--accent-1)] focus:border-[color:var(--accent-1)]"
    />
  </div>

  <div class="mt-2 mx-auto w-48 p-2 rounded-lg border border-[color:var(--main-3)] bg-[color:var(--main-2)]">
    <button type="button" class="w-full inline-flex justify-center items-center rounded-md px-4 py-2 font-semibold text-white bg-[color:var(--accent-1)] hover:brightness-95 active:translate-y-px shadow-sm">
      Login
    </button>
  </div>
</form>
