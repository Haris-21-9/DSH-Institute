async function inspectMiddle() {
  const urls = ['https://digitalskillshouse.pk/', 'https://aec.net.pk/'];
  for (const u of urls) {
    const res = await fetch(u, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'
      }
    });
    const html = await res.text();
    console.log('=== URL:', u, '===');
    console.log('HTTP:', res.status);
    console.log('HTML length:', html.length);
    console.log('Has splash screen / loader?:', html.includes('splash') || html.includes('loader') || html.includes('preloader'));
    
    // Check if there are full-screen splash/preloader divs with inline style or class
    const splashMatches = html.match(/<div[^>]*class="[^"]*(?:splash|preloader|loader-screen)[^"]*"[^>]*>/gi) || [];
    console.log('Splash/Preloader div matches:', splashMatches);

    // Check if body has opacity:0 or display:none or hidden
    const bodyMatch = html.match(/<body[^>]*>/i);
    console.log('Body tag:', bodyMatch ? bodyMatch[0] : 'None');
  }
}
inspectMiddle();
