const router = require("express").Router();
const Link = require("../database/models/Link");
const { generate } = require("yourid");

const {
  ensureAuth,
  ensureGuest,
  ensureEditPermissions,
} = require("../middleware/requireAuth");

router.get("/", ensureGuest, async (req, res) => {
  res.render("index", {
    user: req.user,
    host: process.env.HOST,
    allLinks: await Link.find({}),
    subId: generate({ length: 10 }),
  });
});

router.get("/dash", ensureAuth, async (req, res) =>
  Link.find({ owner: req.user.id }).then((links) =>
    res.render("dash", {
      user: req.user,
      host: process.env.HOST,
      links: links,
      error: req.flash("error"),
      success: req.flash("success"),
      successUpdated: req.flash("success-updated"),
      successDeleted: req.flash("success-deleted"),
      errorCreate: req.flash("error-create"),
    })
  )
);

router.get("/dash/:id", ensureAuth, ensureEditPermissions, async (req, res) => {
  const link = await Link.findOne({ _id: req.params.id }).catch((err) =>
    res.redirect("/dash")
  );
  res.render("link", {
    user: req.user,
    link: link,
  });
});

router.get(
  "/dash/:id/embed",
  ensureAuth,
  ensureEditPermissions,
  async (req, res) => {
    const link = await Link.findOne({ _id: req.params.id }).catch((err) =>
      res.redirect("/dash")
    );
    res.render("embed", {
      user: req.user,
      link: link,
    });
  }
);

router.get(
  "/dash/:id/analytics",
  ensureAuth,
  ensureEditPermissions,
  async (req, res) => {
    const link = await Link.findOne({ _id: req.params.id }).catch((err) =>
      res.redirect("/dash")
    );
    res.render("analytics", {
      user: req.user,
      link: link,
    });
  }
);

router.get("/:slug", async (req, res) => {
  const link = await Link.findOne({ slug: req.params.slug }).catch((err) =>
    res.redirect("/")
  );

  if (link) {
    link.clicks++;

    link.save();
    res.render("redirect", {
      user: req.user,
      link: link,
    });
  } else {
    res.redirect("/");
  }
});

module.exports = router;
