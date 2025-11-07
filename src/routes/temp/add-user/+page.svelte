<script>
  import { UserPlus } from "lucide-svelte";

  let { form } = $props();
</script>

<form class="h-full flex justify-center items-center" method="POST">
  <div class="w-[95%] md:w-[80%] lg:w-80 flex flex-col gap-1">

    {#if form?.error}
		  <p class="text-error">{form.error}</p>
    {:else if form?.success}
      <p class="text-success">{form.success}</p>
	  {/if}
    
    <!--USERNAME LABEL AND INPUT-->
    <label 
      for="username" 
      class="flex flex-col"
    >
      Username
      <input 
        type="text" 
        name="username" 
        class="bg-main-2 outline-none border-none rounded-md ring-2 ring-transparent focus:ring-accent transition" 
        autocomplete="off"
      >
    </label>

    <!--PASSWORD LABEL AND INPUT-->
    <label 
      for="password" 
      class="flex flex-col"
    >
      Password
      <input 
        type="text" 
        name="password" 
        class="bg-main-2 outline-none border-none rounded-md ring-2 ring-transparent focus:ring-accent transition" 
        autocomplete="off"
      >
    </label>

    <label for="admin" class="flex items-center gap-1">
      Admin:
      <input 
        name="admin" 
        type="checkbox"
        value="true"
        class="bg-main-2 border-none rounded-md ring-accent focus:outline-none focus:border-none relative top-px"
      >
    </label>

    <!--SUBMIT BUTTON-->
    <button 
      type="submit"
      class="p-2 w-full flex justify-center items-center bg-accent rounded-md mt-5 text-main hover:bg-accent-2
        transition-all duration-200 hover:-translate-y-0.5 gap-3"
    >
      <UserPlus size={20} />
      Create User
    </button>

  </div>
</form>