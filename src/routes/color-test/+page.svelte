<script>
  import { ArrowRight } from 'lucide-svelte';
</script>

<div class="flex gap-3 text-fore p-4 pb-5 bg-main-2 h-min w-350 rounded-xl">
  <div class="relative">
    <img
      src="https://images.unsplash.com/photo-1482859454392-1b5326395032?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1470"
      alt=""
      class="w-60 rounded-xl"
    >
    <p class="text-fore-3 mt-auto text-xs absolute">Some street in Japan or something.</p>
  </div>
  <div class="flex flex-col">
    <h1 class="text-2xl text-nowrap">Lorem ipsum dolor sit amet consectetur adipisicing elit.</h1>
    <h3 class="text-fore-2">Lorem ipsum dolor sit amet, consectetur adipisicing elit. Assumenda aperiam modi mollitia nihil necessitatibus ducimus?</h3>
    <button class="flex gap-1 mt-auto p-2 bg-accent w-min text-nowrap rounded-xl text-main">
      Read more
      <ArrowRight />
    </button>
  </div>
</div>

<div class="bg-main-2 text-fore p-6 rounded-xl w-96 flex flex-col gap-4">
  <h2 class="text-xl font-semibold">Contact Us</h2>
  <label class="flex flex-col gap-1">
    <span class="text-fore-2 text-sm">Your name</span>
    <input
      type="text"
      placeholder="Jane Doe"
      class="bg-main-3 text-fore p-2 rounded-xl border border-main-4 focus:outline-none focus:ring-2 focus:ring-accent"
    />
  </label>
  <label class="flex flex-col gap-1">
    <span class="text-fore-2 text-sm">Email</span>
    <input
      type="email"
      placeholder="jane@example.com"
      class="bg-main-3 text-fore p-2 rounded-xl border border-main-4 focus:outline-none focus:ring-2 focus:ring-accent"
    />
  </label>
  <label class="flex flex-col gap-1">
    <span class="text-fore-2 text-sm">Message</span>
    <textarea
      rows="3"
      placeholder="Say hi!"
      class="bg-main-3 text-fore p-2 rounded-xl border border-main-4 focus:outline-none focus:ring-2 focus:ring-accent resize-none"
    ></textarea>
  </label>
  <button class="bg-accent text-main py-2 rounded-xl hover:opacity-90 transition">
    Send Message
  </button>
</div>
<div class="bg-main-2 rounded-xl overflow-hidden w-64">
  <img
    src="https://images.unsplash.com/photo-1546435770-a3e426bf472b?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1165"
    alt=""
    class="w-full h-40 object-cover object-center"
  />
  <div class="p-3 flex flex-col gap-2 text-fore">
    <h2 class="text-lg font-semibold">Wireless Headphones</h2>
    <p class="text-fore-2 text-sm">Crisp sound, 30h battery life</p>
    <div class="flex justify-between items-center mt-2">
      <span class="text-accent font-bold">$129</span>
      <button class="bg-accent text-main px-3 py-1 rounded-xl">Buy</button>
    </div>
  </div>
</div>

<div class="bg-main-2 text-fore p-4 rounded-lg w-70 flex flex-col items-start gap-1 h-min">
  <h2 class="text-fore-2 text-sm">Active Users</h2>
  <p class="text-3xl font-bold">2,384</p>
  <p class="text-accent text-sm">+8.2% from last week</p>
</div>
<div class="flex flex-col gap-3 p-4 bg-main-2 rounded-lg w-96 h-min">
  <div class="self-start bg-main-3 text-fore p-2 rounded-lg max-w-80">
    Hey! How’s the color scheme looking today?
  </div>
  <div class="self-end bg-accent text-main p-2 rounded-lg max-w-80">
    Looks great in both modes 😎
  </div>
</div>
<div class="bg-main-2 text-fore p-4 rounded-lg w-80 flex items-center justify-between">
  <div>
    <h3 class="font-semibold">Dark mode</h3>
    <p class="text-fore-3 text-sm">Automatically adjusts your theme. Not really though, it does nothing.</p>
  </div>
  <label class="relative inline-flex items-center cursor-pointer">
  <input type="checkbox" class="sr-only" />
  <div
    class="w-11 h-6 bg-main-3 rounded-full peer focus:outline-none
      peer-checked:bg-accent transition-all"
  ></div>
  <div
    class="absolute left-1 top-1 w-4 h-4 bg-fore rounded-full
      peer-checked:translate-x-5 transition-all"
  ></div>
  </label>
</div>

<table class="bg-main-2 text-fore rounded-xl w-full overflow-hidden border-collapse">
  <thead class="bg-main-3 text-fore-2">
    <tr>
      <th class="text-left p-2">Name</th>
      <th class="text-left p-2">Role</th>
      <th class="text-left p-2">Status</th>
    </tr>
  </thead>
  <tbody>
    <tr class="hover:bg-main-3 transition">
      <td class="p-2">Alice</td>
      <td class="p-2">Designer</td>
      <td class="p-2 text-accent">Active</td>
    </tr>
    <tr class="hover:bg-main-3 transition">
      <td class="p-2">Bob</td>
      <td class="p-2">Developer</td>
      <td class="p-2 text-fore-2">Offline</td>
    </tr>
  </tbody>
</table>

<div class="bg-main-2 text-fore p-6 rounded-xl w-80 flex flex-col gap-4">
  <h2 class="text-2xl font-semibold text-center">Welcome Back</h2>
  
  <input
    type="email"
    placeholder="Email"
    class="bg-main-3 text-fore p-2 rounded-xl border border-main-4 focus:ring-2 focus:ring-accent focus:outline-none"
  />
  <input
    type="password"
    placeholder="Password"
    class="bg-main-3 text-fore p-2 rounded-xl border border-main-4 focus:ring-2 focus:ring-accent focus:outline-none"
  />
  
  <button class="bg-accent text-main py-2 rounded-xl hover:opacity-90 transition">
    Log In
  </button>

  <a href="/color-test" class="text-fore-3 text-sm text-center hover:text-fore-2">
    Forgot password?
  </a>
</div>
<div class="bg-main-2 text-fore p-6 rounded-xl w-96 flex flex-col gap-4">
  <h2 class="text-xl font-semibold">Form Validation</h2>
  
  <div class="flex flex-col gap-1">
    <span class="text-fore-2 text-sm">Email</span>
    <input
      type="email"
      placeholder="user@example.com"
      class="bg-main-3 text-fore p-2 rounded-xl border border-error focus:ring-2 focus:ring-error focus:outline-none"
    />
    <p class="text-error text-sm">Invalid email address.</p>
  </div>

  <div class="flex flex-col gap-1">
    <span class="text-fore-2 text-sm">Username</span>
    <input
      type="text"
      placeholder="yourname"
      class="bg-main-3 text-fore p-2 rounded-xl border border-success focus:ring-2 focus:ring-success focus:outline-none"
    />
    <p class="text-success text-sm">Looks good!</p>
  </div>

  <button class="bg-accent text-main py-2 rounded-xl hover:opacity-90 transition">
    Submit
  </button>
</div>
<div class="flex flex-col gap-6">
  <div class="flex flex-col gap-4 w-96">
    <div class="bg-main-2 text-fore border-l-4 border-success p-3 rounded-xl">
      <strong class="text-success">Success:</strong> Your profile was updated successfully.
    </div>
    <div class="bg-main-2 text-fore border-l-4 border-warning p-3 rounded-xl">
      <strong class="text-warning">Warning:</strong> Check your internet connection.
    </div>
    <div class="bg-main-2 text-fore border-l-4 border-error p-3 rounded-xl">
      <strong class="text-error">Error:</strong> Something went wrong while saving.
    </div>
  </div>
  <div class="flex gap-3 items-center text-sm">
    <span class="px-2 py-1 rounded-full bg-success/20 text-success font-medium">
      Active
    </span>
    <span class="px-2 py-1 rounded-full bg-warning/20 text-warning font-medium">
      Pending
    </span>
    <span class="px-2 py-1 rounded-full bg-error/20 text-error font-medium">
      Failed
    </span>
  </div>
</div>
