async function testProxyOutput() {
  const urls = ['https://digitalskillshouse.pk/', 'https://aec.net.pk/'];
  for (const u of urls) {
    const res = await fetch(`http://localhost:8080/api/proxy?url=${encodeURIComponent(u)}`);
    const html = await res.text();
    console.log('Proxy for:', u);
    console.log('  Status:', res.status);
    console.log('  Length:', html.length);
    console.log('  Has base tag:', html.includes('<base href='));
    console.log('  First 300 chars of body:');
    const bodyIdx = html.indexOf('<body');
    if (bodyIdx !== -1) {
      console.log(html.slice(bodyIdx, bodyIdx + 400));
    }
    console.log('---------------------------------');
  }
}
testProxyOutput();
