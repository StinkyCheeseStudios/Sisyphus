<script>
  import { ChevronRight } from "lucide-svelte";

  let { item } = $props();
</script>

<!--THIS IS CURRENTLY JUST COPIED FROM NavItem.svelte. NOT A WORKING DROPDOWN-->
<li class="w-full h-14 p-1">
  <a 
    href={item.href}
    class="w-full h-full hover:bg-main-3 border border-main-3 rounded-md flex items-center"
  >
    <div class="h-full aspect-square flex justify-center items-center">
      <item.icon size={20} />
    </div>
    <span class="flex justify-center items-center ml-4">
      {item.text}
    </span>
    <div class="ml-auto h-full aspect-square flex justify-center items-center">
      <ChevronRight size={20} />
    </div>
  </a>
</li>