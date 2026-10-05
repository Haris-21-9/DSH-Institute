async function checkMiddleProjects() {
  const urls = [
    'https://www.dealex.pk/',
    'https://digitalskillshouse.pk/', // Row 1 middle!
    'https://vaks.com.pk/',
    'https://usainsulationhouston.com/',
    'https://aec.net.pk/', // Row 2 middle!
    'https://mobilearcadeltd.co.uk/',
    'https://www.kambostrong.nz/',
    'https://www.expeditors.com/',
    'https://wwgc.com.pk/'
  ];

  for (let i = 0; i < urls.length; i++) {
    const u = urls[i];
    try {
      const res = await fetch(u, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'
        }
      });
      const text = await res.text();
      console.log(`[${i + 1}] ${u} => HTTP ${res.status}, Len: ${text.length}`);
    } catch (e) {
      console.error(`[${i + 1}] ${u} => ERROR:`, e.message);
    }
  }
}

checkMiddleProjects();
