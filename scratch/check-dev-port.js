async function checkDevServer() {
  const ports = [8080, 5173, 3000];
  for (const p of ports) {
    try {
      const res = await fetch(`http://localhost:${p}/api/proxy?url=https://digitalskillshouse.pk/`);
      console.log(`Port ${p} is active! Status:`, res.status, 'Len:', (await res.text()).length);
    } catch(e) {
      console.log(`Port ${p} error:`, e.message);
    }
  }
}
checkDevServer();
