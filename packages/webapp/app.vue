<template>
  <div id="app" class="bg-gray-900 w-screen h-screen flex flex-col">
    <div class="bg-gray-800 flex items-center justify-between p-2">
      <div class="flex items-center">
        <div
          class="h-3 w-3 rounded-full mr-2"
          :class="{ 'bg-green-500': isConnected, 'bg-red-500': !isConnected }"
        ></div>
        <span class="text-sm text-white">{{ connectionStatus }}</span>
      </div>
      <span class="text-sm text-white"
        >{{ socketCount }} sockets connected</span
      >
    </div>
    <div class="flex-1 overflow-y-auto p-4">
      <ul class="list-none">
        <li
          v-for="(query, index) in queries"
          :key="index"
          class="p-2 border-b border-gray-800 flex items-center"
        >
          <span class="text-gray-400">#{{ index + 1 }}</span>
          <span
            class="text-white flex-1 ml-2"
            :class="{ 'text-gray-500': query.fromCache }"
          >
            {{ query.text }}
          </span>
          <span class="text-gray-400">{{ query.executionTime }}ms</span>
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      isConnected: true,
      socketCount: 0,
      queries: [
        {
          text: JSON.stringify([
            { $match: { status: "active" } },
            { $group: { _id: "$category", count: { $sum: 1 } } },
            { $sort: { count: -1 } },
          ]),
          fromCache: false,
          executionTime: 30,
        },
        {
          text: JSON.stringify([
            {
              $lookup: {
                from: "orders",
                localField: "_id",
                foreignField: "customer_id",
                as: "orders",
              },
            },
            {
              $project: { name: 1, email: 1, orderCount: { $size: "$orders" } },
            },
            { $sort: { orderCount: -1 } },
            { $limit: 10 },
          ]),
          fromCache: true,
          executionTime: 15,
        },
        {
          text: JSON.stringify([
            { $match: { age: { $gte: 18, $lte: 65 } } },
            { $group: { _id: "$gender", avgSalary: { $avg: "$salary" } } },
            { $sort: { avgSalary: -1 } },
          ]),
          fromCache: false,
          executionTime: 50,
        },
      ],
    };
  },
  computed: {
    connectionStatus() {
      return this.isConnected ? "Server is active" : "Server is not active";
    },
  },
};
</script>

<style scoped>
/* Import Tailwind CSS styles */
@import "tailwindcss/base";
@import "tailwindcss/components";
@import "tailwindcss/utilities";

/* Import Font Awesome styles */
@import "@fortawesome/fontawesome-free/css/all.css";

/* Override Font Awesome defaults */
.fa {
  font-size: inherit;
  line-height: inherit;
}

/* Set root element to full window size */
html,
body {
  height: 100%;
  width: 100%;
  margin: 0;
  padding: 0;
}

/* Set root element as flex
    to make it fill the window */
#app {
  display: flex;
}
</style>
