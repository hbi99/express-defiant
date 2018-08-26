const router = require("koa-router")()

router.get("/labs/search", async (ctx, next) => {
  const data = {a: 1}

  await ctx.render("poc", data)
})

module.exports = router
