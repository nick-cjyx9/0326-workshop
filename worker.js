let comments = "hello\n";

function html(body) {
  return new Response(body, {
    headers: {
      "content-type": "text/html; charset=utf-8",
      "cache-control": "no-store",
    },
  });
}

function renderPxssPage() {
  return `<!doctype html>
<html lang="en">
<body>
  <h1>Comments of blog xxoo</h1>
  <textarea disabled>${comments}</textarea>
  <form action="/demo/pxss/set">
    <input type="text" name="comments" />
    <input type="submit" value="send" />
  </form>
  <p><a href="/demo/pxss/reset">reset comments</a></p>
</body>
</html>`;
}

function renderRxssPage() {
  return `<!doctype html>
<html lang="en">
<body>
  <form action="/demo/rxss">
    <input type="text" name="q">
    <input type="submit" value="search">
  </form>
  <div id="holder"></div>
  <script>
    const query = new URLSearchParams(window.location.search).get('q')
    if (query) {
      document.title = \`Searching \${query}\`
      holder.innerHTML = \`<h2>Search result for \${query}</h2>
      <ul>
        <li>choose life?!</li>
        <li>choose life?!</li>
      </ul>
      \`
    }
  </script>
</body>
</html>`;
}

function renderStealPage() {
  return `<!doctype html>
<html lang="en">
<body>
  <form action="/demo/steal">
    <input type="text" name="q">
    <input type="submit" value="search">
  </form>
  <div id="holder"></div>
  <script>
    document.cookie = 'flag=flag{xss_target}; path=/'
  </script>
  <script>
    const query = new URLSearchParams(location.search).get('q')
    if (query) {
      document.title = \`Searching \${query}\`
      holder.innerHTML = \`<h2>Search result for \${query}</h2>
      <ul>
        <li>choose life?!</li>
        <li>choose life?!</li>
      </ul>
      \`
    }
  </script>
</body>
</html>`;
}

function handleDemo(url) {
  const path = url.pathname.replace(/\/+$/, "") || "/";

  if (path === "/demo/pxss") return html(renderPxssPage());
  if (path === "/demo/rxss") return html(renderRxssPage());
  if (path === "/demo/steal") return html(renderStealPage());

  if (path === "/demo/pxss/set") {
    const newComment = url.searchParams.get("comments");
    if (newComment) comments += `${newComment}\n`;
    return Response.redirect(`${url.origin}/demo/pxss`, 302);
  }

  if (path === "/demo/pxss/reset") {
    comments = "hello\n";
    return Response.redirect(`${url.origin}/demo/pxss`, 302);
  }

  return null;
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const demoResponse = handleDemo(url);
    if (demoResponse) return demoResponse;
    return env.ASSETS.fetch(request);
  },
};
