/*
* 存储型 XSS
* 此类 XSS 不需要用户单击特定 URL 就能执行跨站脚本，
* 攻击者事先将恶意代码上传或储存到漏洞服务器中，
* 只要受害者浏览包含此恶意代码的页面就会执行恶意代码。
* 持久型 XSS 一般出现在网站留言、评论、博客日志等交互处，
* 恶意脚本存储到客户端或者服务端的数据库中。
*/

let comments = 'hello\n'

export function handleStoredXss(url: URL) {
  if (url.pathname === '/demo/pxss') {
    return new Response(`
      <!DOCTYPE html>
      <html>
      <body>
        <h1>Comments of blog xxoo</h1>
        <textarea disabled>${comments}</textarea>
        <form action="/demo/pxss/set">
          <input type="text" name="comments" />
          <input type="submit" value="send" />
        </form>
      </body>
      </html>
    `, { headers: { 'Content-Type': 'text/html; charset=utf-8' } })
  }

  if (url.pathname === '/demo/pxss/set') {
    const newComments = url.searchParams.get('comments')
    if (newComments)
      comments += `${newComments}\n`

    return Response.redirect(`${url.origin}/demo/pxss`, 302)
  }

  return null
}
