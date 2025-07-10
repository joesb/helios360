{
  let max = 0, curr = 0, firstTs = Number.NEGATIVE_INFINITY, prevTs = Number.NEGATIVE_INFINITY;

  new PerformanceObserver((entryList) => {
    for (const entry of entryList.getEntries()) {
      if (entry.hadRecentInput) continue;
      if (entry.startTime - firstTs > 5000 || entry.startTime - prevTs > 1000) {
        firstTs = entry.startTime;
        curr = 0;
      }
      prevTs = entry.startTime;
      curr += entry.value;
      max = Math.max(max, curr);
      console.log('Current MAX-session-gap1s-limit5s value:', max, entry);
    }
  }).observe({type: 'layout-shift', buffered: true});
}