import { connect } from "react-redux"
import Route from "misago/components/thread/route"
import misago from "misago/index"

export function select(store) {
  return {
    participants: store.participants,
    poll: store.poll,
    posts: store.posts,
    thread: store.thread,
    tick: store.tick.tick,
    user: store.auth.user,
  }
}

export function paths() {
  const thread = misago.get("THREAD")
  const posts = misago.get("POSTS")  
  const basePath = thread.url.index.replace(
    thread.slug + "-" + thread.pk,
    ":slug"
  )
  //console.log(posts.results[0].id)
  return [
    {
      path: basePath,
      component: connect(select)(Route),
    },
    {
      path: basePath+"postq/"+posts.results[0].id,
      component: connect(select)(Route),
    },
    {
      path: basePath + ":page/",
      component: connect(select)(Route),
    },
  ]
}
