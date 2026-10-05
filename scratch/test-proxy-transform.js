async function testProxy() {
  const urls = ['https://www.dealex.pk/', 'https://digitalskillshouse.pk/', 'https://vaks.com.pk/'];
  for (const normalized of urls) {
    const response = await fetch(normalized, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
        "Cache-Control": "no-cache",
      },
      redirect: "follow",
    });

    const finalUrl = response.url || normalized;
    let html = await response.text();

    console.log('--- TEST PROXY FOR:', finalUrl, '---');
    console.log('Original length:', html.length);

    // Let's see what stylesheets are inside:
    const linkMatches = html.match(/<link[^>]+>/gi) || [];
    console.log('Total <link> tags:', linkMatches.length);
    const cssLinks = linkMatches.filter(l => l.includes('stylesheet'));
    console.log('CSS stylesheet tags count:', cssLinks.length);
    console.log('Sample CSS tags:', cssLinks.slice(0, 3));

    // Check if images are using data-src, data-lazy-src, src:
    const imgTags = html.match(/<img[^>]+>/gi) || [];
    console.log('Total <img> tags:', imgTags.length);
    console.log('Sample <img> tags:', imgTags.slice(0, 3));
  }
}

testProxy();
