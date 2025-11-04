<script>
  import { ChevronRight } from "lucide-svelte";

  let { item } = $props();
</script>

<li>
  <a 
    href={item.href}
    class="w-full h-12 hover:bg-main-3 border border-main-3 rounded-md flex items-center text-nowrap"
  >
    <div class="h-full aspect-square flex justify-center items-center">
      <item.icon size={20} />
    </div>
    <span class="flex justify-center items-center ml-4">
      {item.text}
    </span>
  </a>
</li>